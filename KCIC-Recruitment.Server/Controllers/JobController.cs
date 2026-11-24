using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Recruitment.Server.DTOs;
using Recruitment.Server.Interfaces;
using Recruitment.Server.Models;
using Recruitment.Server.Services;
using Recruitment.Server.Utilities;

namespace Recruitment.Server.Controllers
{
    /// <summary>
    /// Job adverts and the application workflow, built only on BC codeunit 50034 "Recruitment".
    /// Rules BC does not enforce (ownership, edit lock after submission, completeness before
    /// submission, referee minimum, required documents) are enforced here.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("/api/job")]
    public class JobController(IRecruitmentService bc, IOptions<RecruitmentOptions> options, ILogger<JobController> logger) : Controller
    {
        private readonly IRecruitmentService _bc = bc;
        private readonly RecruitmentOptions _options = options.Value;
        private readonly ILogger<JobController> _logger = logger;

        private string? Username => User.Claims.FirstOrDefault(x => x.Type == "username")?.Value;

        // ── Adverts (public) ───────────────────────────────────────────────────

        [AllowAnonymous]
        [HttpGet("advertisedjobs")]
        public async Task<IActionResult> AdvertisedJobs()
        {
            try
            {
                return Ok(Success(await LoadAdvertisedJobsAsync()));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching advertised jobs");
                return BadRequest(Failure(ErrorText.From(ex)));
            }
        }

        [AllowAnonymous]
        [HttpGet("jobrequirements")]
        public async Task<IActionResult> JobRequirements(string jobId, string? requisitionNo = null)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(jobId)) return BadRequest(Failure("Job ID is required."));

                var job = (await LoadAdvertisedJobsAsync()).FirstOrDefault(j =>
                    j.JobId == jobId && (string.IsNullOrEmpty(requisitionNo) || j.DocumentNo == requisitionNo));
                if (job == null) return NotFound(Failure("This advert is no longer available."));

                var purposeTask = _bc.GetJobPurposeAsync(jobId);
                var requirementsTask = _bc.GetJobRequirementsAsync(jobId);
                var responsibilitiesTask = _bc.GetJobResponsibilitiesAsync(jobId);
                await Task.WhenAll(purposeTask, requirementsTask, responsibilitiesTask);

                job.Purpose = purposeTask.Result;
                job.RequiredDocuments = _options.DocumentCategories.Where(c => c.Required)
                    .Select(c => new JobRequirementDto { Code = c.Code, Description = c.Description }).ToList();

                return Ok(Success(new JobDetailsDto
                {
                    JobInfo = job,
                    Requirements = BcJson.List<JobRequirementDto>(requirementsTask.Result),
                    Responsibilities = BcJson.List<JobResponsibilityDto>(responsibilitiesTask.Result)
                }));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching job details for {JobId}", jobId);
                return BadRequest(Failure(ErrorText.From(ex)));
            }
        }

        // ── Starting and tracking applications ─────────────────────────────────

        [HttpPost("submit")]
        public async Task<IActionResult> StartApplication([FromBody] SubmitApplicationDto request)
        {
            try
            {
                var username = Username;
                if (string.IsNullOrEmpty(username)) return Unauthorized(Failure("Please sign in again."));

                var job = (await LoadAdvertisedJobsAsync()).FirstOrDefault(j =>
                    j.JobId == request.JobId && j.DocumentNo == request.RequisitionNo);
                if (job == null) return BadRequest(Failure("This advert is closed and no longer accepts applications."));

                // BC returns the existing application number if this applicant already started one for this advert.
                var applicationNo = await _bc.SubmitJobApplicationAsync(username, request.RequisitionNo, request.JobId);
                if (string.IsNullOrWhiteSpace(applicationNo))
                    return BadRequest(Failure("Your account could not be found. Please sign in again."));

                return Ok(Success(applicationNo, "Application started"));
            }
            catch (BusinessCentralException ex)
            {
                _logger.LogWarning(ex, "BC rejected application start");
                return BadRequest(Failure(ErrorText.From(ex)));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting application");
                return BadRequest(Failure(ErrorText.From(ex)));
            }
        }

        [HttpGet("applications")]
        public async Task<IActionResult> GetApplications()
        {
            try
            {
                var username = Username;
                if (string.IsNullOrEmpty(username)) return Unauthorized(Failure("Please sign in again."));

                var rows = BcJson.Array(await _bc.GetApplicationsAsync(username)).OfType<JsonObject>().ToList();
                var submitted = await Task.WhenAll(rows.Select(r => _bc.IsApplicationSubmittedAsync(BcJson.Text(r, "DocumentNo"))));
                for (var i = 0; i < rows.Count; i++)
                {
                    rows[i]["Submitted"] = submitted[i];
                    rows[i]["CandidateStatus"] = ApplicationRules.CandidateStatus(submitted[i], BcJson.Text(rows[i], "Status"));
                }
                return Ok(Success(rows.OrderByDescending(r => BcJson.Text(r, "DocumentNo")).ToList()));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching applications");
                return BadRequest(Failure(ErrorText.From(ex)));
            }
        }

        [HttpGet("application-details")]
        public async Task<IActionResult> ApplicationDetails(string applicationNo)
        {
            try
            {
                var app = await LoadOwnedApplicationAsync(applicationNo);
                if (app == null) return NotFound(Failure("Application not found."));
                return Ok(Success(app.Details));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading application {ApplicationNo}", applicationNo);
                return BadRequest(Failure(ErrorText.From(ex)));
            }
        }

        /// <summary>Everything the wizard needs about rules and progress for one application.</summary>
        [HttpGet("application-context")]
        public async Task<IActionResult> ApplicationContext(string applicationNo)
        {
            try
            {
                var app = await LoadOwnedApplicationAsync(applicationNo);
                if (app == null) return NotFound(Failure("Application not found."));

                var jobId = BcJson.Text(app.Details, "JobId");
                var requirementsTask = _bc.GetMinimumRequirementsAsync(jobId);
                var membershipsTask = _bc.GetProfessionalMembershipsAsync(applicationNo);
                await Task.WhenAll(requirementsTask, membershipsTask);

                var context = new JsonObject
                {
                    ["ApplicationNo"] = applicationNo,
                    ["JobId"] = jobId,
                    ["JobTitle"] = BcJson.Text(app.Details, "JobTitle"),
                    ["RequisitionNo"] = BcJson.Text(app.Details, "ReferenceNo"),
                    ["Status"] = BcJson.Text(app.Details, "Status"),
                    ["Submitted"] = app.Submitted,
                    ["CanEdit"] = !app.Submitted,
                    ["CandidateStatus"] = BcJson.Text(app.Details, "CandidateStatus"),
                    ["MinimumReferees"] = _options.MinimumReferees,
                    ["MinimumAcademicQualifications"] = _options.MinimumAcademicQualifications,
                    ["MinimumRequirements"] = new JsonArray(BcJson.List<JobRequirementDto>(requirementsTask.Result)
                        .Select(r => (JsonNode)new JsonObject { ["Code"] = r.Code, ["Description"] = r.Description }).ToArray()),
                    ["DocumentCategories"] = new JsonArray(_options.DocumentCategories
                        .Select(c => (JsonNode)new JsonObject { ["Code"] = c.Code, ["Description"] = c.Description, ["Required"] = c.Required }).ToArray()),
                    ["Memberships"] = new JsonArray(BcJson.List<ProfessionalMembershipDto>(membershipsTask.Result)
                        .Select(m => (JsonNode)new JsonObject
                        {
                            ["Id"] = m.Id, ["Description"] = m.Description, ["MembershipNo"] = m.MembershipNo,
                            ["MembershipDate"] = m.MembershipDate, ["Status"] = m.Status
                        }).ToArray())
                };
                return Ok(Success(context));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading application context for {ApplicationNo}", applicationNo);
                return BadRequest(Failure(ErrorText.From(ex)));
            }
        }

        // ── Personal details ───────────────────────────────────────────────────

        [HttpPost("update-personal-details")]
        public async Task<IActionResult> UpdatePersonalDetails([FromBody] PersonalDetailsUpdateDto request)
        {
            return await EditAsync(request.ApplicationNo, async app =>
            {
                var saved = await _bc.UpdateApplicationPersonalDetailsAsync(
                    request.ApplicationNo, request.Salutation, request.FirstName, request.MiddleName, request.LastName,
                    request.IDPassportNo,
                    Username!, // keep the application's e-mail tied to the signed-in account
                    request.PhoneNo, request.AltPhoneNo, request.DateOfBirth, request.Gender, request.MaritalStatus,
                    request.Country, request.CountyCode, request.PostalAddress, request.PostalCode, request.Disability,
                    request.Disability ? request.DisabilityType : string.Empty,
                    request.Disability ? request.PWDNumber : string.Empty,
                    request.KRAPin, request.Citizenship);
                return saved
                    ? Ok(Success(true, "Personal details saved"))
                    : BadRequest(Failure("Personal details could not be saved."));
            });
        }

        // ── Academic qualifications ────────────────────────────────────────────

        [HttpGet("academic-qualifications")]
        public async Task<IActionResult> GetAcademicQualifications(string applicationNo) =>
            await ReadAsync(applicationNo, () => LoadAcademicQualificationsAsync(applicationNo));

        [HttpPost("add-academic-qualification")]
        public async Task<IActionResult> AddAcademicQualification([FromBody] AddAcademicQualificationDto request)
        {
            return await EditAsync(request.ApplicationNo, async app =>
            {
                await _bc.AddAcademicQualificationAsync(request.ApplicationNo, request.AreaOfStudy, request.Course,
                    request.Institution, request.StartDate, request.EndDate, request.Grade, DateTime.MinValue, request.CourseDescription);
                return Ok(Success(true, "Academic qualification added"));
            });
        }

        [HttpDelete("delete-academic-qualification")]
        public async Task<IActionResult> DeleteAcademicQualification(string applicationNo, string id)
        {
            return await EditAsync(applicationNo, async app =>
            {
                var rows = await LoadAcademicQualificationsAsync(applicationNo);
                if (!rows.Any(r => r.Id == id)) return NotFound(Failure("Qualification not found on this application."));
                await _bc.RemoveAcademicQualificationAsync(id);
                return Ok(Success(true, "Academic qualification removed"));
            });
        }

        // ── Work experience (BC has no working delete for these rows) ──────────

        [HttpGet("work-experience")]
        public async Task<IActionResult> GetWorkExperience(string applicationNo) =>
            await ReadAsync(applicationNo, async () => BcJson.List<WorkExperienceDto>(await _bc.GetWorkExperienceAsync(applicationNo)));

        [HttpPost("add-work-experience")]
        public async Task<IActionResult> AddWorkExperience([FromBody] AddWorkExperienceDto request)
        {
            return await EditAsync(request.ApplicationNo, async app =>
            {
                await _bc.InsertWorkExperienceAsync(request.ApplicationNo, request.Position, request.Institution, request.StartDate,
                    request.IsCurrent ? DateTime.MinValue : request.EndDate ?? DateTime.MinValue, request.Responsibility, request.IsCurrent);
                return Ok(Success(true, "Work experience added"));
            });
        }

        // ── Professional qualifications & memberships (no working delete in BC) ─

        [HttpGet("professional-training")]
        public async Task<IActionResult> GetProfessionalTraining(string applicationNo) =>
            await ReadAsync(applicationNo, async () => BcJson.List<ProfessionalTrainingDto>(await _bc.GetProfessionalQualificationsAsync(applicationNo)));

        [HttpPost("add-professional-training")]
        public async Task<IActionResult> AddProfessionalTraining([FromBody] AddProfessionalTrainingDto request)
        {
            return await EditAsync(request.ApplicationNo, async app =>
            {
                await _bc.InsertProfessionalQualificationAsync(request.ApplicationNo, request.Description, request.Institution, request.Year);
                return Ok(Success(true, "Professional qualification added"));
            });
        }

        [HttpGet("professional-memberships")]
        public async Task<IActionResult> GetProfessionalMemberships(string applicationNo) =>
            await ReadAsync(applicationNo, async () => BcJson.List<ProfessionalMembershipDto>(await _bc.GetProfessionalMembershipsAsync(applicationNo)));

        [HttpPost("add-professional-membership")]
        public async Task<IActionResult> AddProfessionalMembership([FromBody] AddProfessionalMembershipDto request)
        {
            return await EditAsync(request.ApplicationNo, async app =>
            {
                await _bc.InsertProfessionalMembershipAsync(request.ApplicationNo, request.BodyName, request.MembershipNo,
                    request.MembershipDate ?? DateTime.MinValue, request.Status is 1 or 2 ? request.Status : 1);
                return Ok(Success(true, "Professional membership added"));
            });
        }

        // ── Referees ───────────────────────────────────────────────────────────
        // GetListofApplicationReferees returns no Id, so referees cannot be removed through BC.

        [HttpGet("referees")]
        public async Task<IActionResult> GetReferees(string applicationNo) =>
            await ReadAsync(applicationNo, () => LoadRefereesAsync(applicationNo));

        [HttpPost("add-referee")]
        public async Task<IActionResult> AddReferee([FromBody] AddRelationshipDto request)
        {
            return await EditAsync(request.ApplicationNo, async app =>
            {
                await _bc.InsertRelationshipsAsync("referee", request.ApplicationNo, request.FirstName.Trim(), request.MiddleName.Trim(),
                    request.LastName.Trim(), request.PhoneNo, request.Email, request.Relationship, request.Institution);
                return Ok(Success(true, "Referee added"));
            });
        }

        // ── Documents ──────────────────────────────────────────────────────────

        [HttpGet("attached-documents")]
        public async Task<IActionResult> GetAttachedDocuments(string applicationNo) =>
            await ReadAsync(applicationNo, () => LoadDocumentsAsync(applicationNo));

        [HttpPost("upload-document")]
        [RequestSizeLimit(10 * 1024 * 1024)]
        public async Task<IActionResult> UploadDocument([FromBody] UploadAttachmentDto request)
        {
            return await EditAsync(request.ApplicationNo, async app =>
            {
                if (string.IsNullOrWhiteSpace(request.Attachment) || string.IsNullOrWhiteSpace(request.FileName))
                    return BadRequest(Failure("Select a document to upload."));
                if (!request.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
                    return BadRequest(Failure("Only PDF documents are accepted."));

                var category = _options.DocumentCategories.FirstOrDefault(c =>
                    string.Equals(c.Code, request.RequirementCode, StringComparison.OrdinalIgnoreCase));
                if (category == null) return BadRequest(Failure("Select the type of document you are uploading."));

                var fileName = ApplicationRules.TaggedFileName(category.Code, request.FileName);
                var existing = await LoadDocumentsAsync(request.ApplicationNo);
                var stem = Path.GetFileNameWithoutExtension(fileName);
                for (var n = 2; existing.Any(d => string.Equals($"{d.RequirementCode}__{d.FileName}", stem, StringComparison.OrdinalIgnoreCase)); n++)
                    stem = $"{Path.GetFileNameWithoutExtension(fileName)} ({n})";

                await _bc.UploadDocumentAsync(request.ApplicationNo, stem + ".pdf", request.Attachment, 0);
                return Ok(Success(true, "Document uploaded"));
            });
        }

        [HttpDelete("delete-document")]
        public async Task<IActionResult> DeleteDocument(string id, string applicationNo)
        {
            return await EditAsync(applicationNo, async app =>
            {
                var documents = await LoadDocumentsAsync(applicationNo);
                if (!documents.Any(d => d.Id == id)) return NotFound(Failure("Document not found on this application."));
                await _bc.RemoveDocumentAsync(id);
                return Ok(Success(true, "Document removed"));
            });
        }

        // ── Review and submission ──────────────────────────────────────────────

        /// <summary>Lists what is still missing before the application can be submitted.</summary>
        [HttpGet("submission-check")]
        public async Task<IActionResult> SubmissionCheck(string applicationNo)
        {
            try
            {
                var app = await LoadOwnedApplicationAsync(applicationNo);
                if (app == null) return NotFound(Failure("Application not found."));
                return Ok(Success(await MissingItemsAsync(applicationNo, app.Details)));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking application {ApplicationNo}", applicationNo);
                return BadRequest(Failure(ErrorText.From(ex)));
            }
        }

        [HttpPost("submit-application")]
        public async Task<IActionResult> SubmitFinalApplication(string applicationNo)
        {
            return await EditAsync(applicationNo, async app =>
            {
                var missing = await MissingItemsAsync(applicationNo, app.Details);
                if (missing.Count > 0)
                    return BadRequest(new ApiResponse<List<string>> { Success = false, Message = "Complete the following before submitting: " + string.Join(" ", missing), Data = missing });

                await _bc.SubmitApplicationAsync(applicationNo);
                if (!await _bc.IsApplicationSubmittedAsync(applicationNo))
                    return BadRequest(Failure("Business Central did not confirm the submission. Please try again."));
                return Ok(Success(true, "Application submitted"));
            });
        }

        // ── Helpers ────────────────────────────────────────────────────────────

        private sealed record OwnedApplication(JsonObject Details, bool Submitted);

        private async Task<List<JobDto>> LoadAdvertisedJobsAsync() => BcJson.List<JobDto>(await _bc.GetAdvertisedJobsAsync());

        /// <summary>Loads the application only if it belongs to the signed-in applicant.</summary>
        private async Task<OwnedApplication?> LoadOwnedApplicationAsync(string applicationNo)
        {
            var username = Username;
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(applicationNo)) return null;

            var details = BcJson.Object(await _bc.GetJobApplicationDetailsAsync(applicationNo));
            if (details == null || !string.Equals(BcJson.Text(details, "Email"), username, StringComparison.OrdinalIgnoreCase))
                return null;

            var submitted = await _bc.IsApplicationSubmittedAsync(applicationNo);
            details["Submitted"] = submitted;
            details["CandidateStatus"] = ApplicationRules.CandidateStatus(submitted, BcJson.Text(details, "Status"));
            return new OwnedApplication(details, submitted);
        }

        private async Task<IActionResult> ReadAsync<T>(string applicationNo, Func<Task<T>> load)
        {
            try
            {
                if (await LoadOwnedApplicationAsync(applicationNo) == null) return NotFound(Failure("Application not found."));
                return Ok(Success(await load()));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reading application {ApplicationNo}", applicationNo);
                return BadRequest(Failure(ErrorText.From(ex)));
            }
        }

        /// <summary>Runs a change only for the owner's unsubmitted application, translating BC errors.</summary>
        private async Task<IActionResult> EditAsync(string applicationNo, Func<OwnedApplication, Task<IActionResult>> change)
        {
            try
            {
                var app = await LoadOwnedApplicationAsync(applicationNo);
                if (app == null) return NotFound(Failure("Application not found."));
                if (app.Submitted) return BadRequest(Failure("This application has been submitted and can no longer be changed."));
                return await change(app);
            }
            catch (BusinessCentralException ex)
            {
                _logger.LogWarning(ex, "BC rejected change to {ApplicationNo}", applicationNo);
                return BadRequest(Failure(ErrorText.From(ex)));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing application {ApplicationNo}", applicationNo);
                return BadRequest(Failure(ErrorText.From(ex)));
            }
        }

        /// <summary>
        /// GetAcademicQualifications returns the Id needed for deletion; GetAcademicQualificationDetails
        /// returns the area of study. Both read the same rows in key order, so merge them.
        /// </summary>
        private async Task<List<AcademicQualificationDto>> LoadAcademicQualificationsAsync(string applicationNo)
        {
            var withIdTask = _bc.GetAcademicQualificationsAsync(applicationNo);
            var detailsTask = _bc.GetAcademicQualificationDetailsAsync(applicationNo);
            await Task.WhenAll(withIdTask, detailsTask);

            var rows = BcJson.List<AcademicQualificationDto>(withIdTask.Result);
            var details = BcJson.Array(detailsTask.Result).OfType<JsonObject>().ToList();
            foreach (var row in rows)
            {
                var match = details.FirstOrDefault(d =>
                    BcJson.Text(d, "Code") == row.Code && BcJson.Text(d, "Description") == row.Description &&
                    BcJson.Text(d, "Institution") == row.Institution);
                if (match != null) row.AreaOfStudy = BcJson.Text(match, "AreaOfStudy");
            }
            return rows;
        }

        private async Task<List<RelationshipDto>> LoadRefereesAsync(string applicationNo)
        {
            var rows = BcJson.List<RelationshipDto>(await _bc.GetListofApplicationRefereesAsync(applicationNo));
            rows.ForEach(r => r.Type = "Referees");
            return rows;
        }

        private async Task<List<AttachmentDto>> LoadDocumentsAsync(string applicationNo)
        {
            var rows = BcJson.Array(await _bc.GetAttachedDocumentsAsync(applicationNo)).OfType<JsonObject>();
            return rows.Select(row =>
            {
                var (code, name) = ApplicationRules.ParseFileName(BcJson.Text(row, "FileName"), _options.DocumentCategories);
                return new AttachmentDto
                {
                    Id = BcJson.Text(row, "Id"),
                    FileName = name,
                    FileExtension = BcJson.Text(row, "FileExtension"),
                    RequirementCode = code,
                    DocumentType = _options.DocumentCategories.FirstOrDefault(c => c.Code == code)?.Description ?? "Other",
                    DocumentDate = BcJson.Text(row, "DocumentDate")
                };
            }).ToList();
        }

        private async Task<List<string>> MissingItemsAsync(string applicationNo, JsonObject details)
        {
            var missing = new List<string>();

            foreach (var (key, label) in new[]
            {
                ("IDPassportNo", "ID / passport number"), ("PhoneNo", "phone number"), ("DateOfBirth", "date of birth"),
                ("Gender", "gender"), ("Country", "country"), ("Address", "postal address")
            })
            {
                if (string.IsNullOrWhiteSpace(BcJson.Text(details, key)))
                    missing.Add($"Add your {label} in Personal Details.");
            }

            var openAdverts = await LoadAdvertisedJobsAsync();
            if (!openAdverts.Any(j => j.DocumentNo == BcJson.Text(details, "ReferenceNo")))
                missing.Add("This advert has closed and no longer accepts submissions.");

            var academicTask = _bc.GetAcademicQualificationsAsync(applicationNo);
            var refereesTask = LoadRefereesAsync(applicationNo);
            var documentsTask = LoadDocumentsAsync(applicationNo);
            await Task.WhenAll(academicTask, refereesTask, documentsTask);

            var academicCount = BcJson.Array(academicTask.Result).Count;
            if (academicCount < _options.MinimumAcademicQualifications)
                missing.Add($"Add at least {_options.MinimumAcademicQualifications} academic qualification(s).");

            var refereeCount = refereesTask.Result.Count;
            if (refereeCount < _options.MinimumReferees)
                missing.Add($"Add {_options.MinimumReferees - refereeCount} more referee(s) (minimum {_options.MinimumReferees}).");

            foreach (var category in _options.DocumentCategories.Where(c => c.Required))
            {
                if (!documentsTask.Result.Any(d => d.RequirementCode == category.Code))
                    missing.Add($"Attach your {category.Description}.");
            }
            return missing;
        }

        private static ApiResponse<T> Success<T>(T data, string message = "") => new() { Success = true, Message = message, Data = data };
        private static ApiResponse<object> Failure(string message) => new() { Success = false, Message = message };
    }
}
