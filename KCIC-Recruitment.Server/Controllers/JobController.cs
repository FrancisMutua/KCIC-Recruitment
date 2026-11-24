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
    /// Job adverts and the KCIC application workflow, built only on BC codeunit 70007 "Recruitment".
    /// The codeunit does not check who owns an application, so every application call here first
    /// confirms the application's e-mail is the signed-in applicant's. Portal rules (minimum
    /// referees / next of kin, required documents, open advert) are checked before submission.
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

                var descriptionTask = _bc.GetJobDescriptionAsync(job.DocumentNo);
                var requirementsTask = _bc.GetJobRequirementsAsync(jobId);
                var responsibilitiesTask = _bc.GetJobResponsibilitiesAsync(jobId);
                var competenciesTask = _bc.GetKeyCompetenciesAsync(jobId);
                await Task.WhenAll(descriptionTask, requirementsTask, responsibilitiesTask, competenciesTask);

                var description = BcJson.Object(descriptionTask.Result);
                job.Purpose = BcJson.Text(description, "jobPurpose");
                job.RequiredDocuments = _options.DocumentCategories.Where(c => c.Required)
                    .Select(c => new JobRequirementDto { Code = c.Code, Description = c.Description }).ToList();

                // Prefer the responsibility lines; fall back to the requisition's free-text responsibilities.
                var responsibilities = BcJson.List<JobResponsibilityDto>(responsibilitiesTask.Result);
                var responsibilitiesText = BcJson.Text(description, "keyResponsibilities");
                if (responsibilities.Count == 0 && !string.IsNullOrWhiteSpace(responsibilitiesText))
                    responsibilities.Add(new JobResponsibilityDto { Code = "1", Description = responsibilitiesText });

                return Ok(Success(new JobDetailsDto
                {
                    JobInfo = job,
                    Requirements = BcJson.List<JobRequirementDto>(requirementsTask.Result),
                    Responsibilities = responsibilities,
                    Competencies = BcJson.List<JobRequirementDto>(competenciesTask.Result)
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
                    return BadRequest(Failure("The application could not be started. Please try again."));

                return Ok(Success(applicationNo.Trim(), "Application started"));
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

                var rows = BcJson.Rows(await _bc.GetApplicationsAsync(username)).Select(row =>
                {
                    var status = BcJson.Text(row, "status");
                    return new JsonObject
                    {
                        ["DocumentNo"] = BcJson.Text(row, "applicationNo"),
                        ["JobId"] = BcJson.Text(row, "jobAppliedFor"),
                        ["JobTitle"] = BcJson.Text(row, "jobTitle"),
                        ["DocumentDate"] = BcJson.Text(row, "dateApplied"),
                        ["RequisitionNo"] = BcJson.Text(row, "requisitionNo"),
                        ["ClosingDate"] = BcJson.Text(row, "closingDate"),
                        ["Status"] = status,
                        ["Submitted"] = ApplicationRules.IsSubmitted(status),
                        ["CandidateStatus"] = ApplicationRules.CandidateStatus(status)
                    };
                });
                return Ok(Success(rows.OrderByDescending(r => BcJson.Text(r, "DocumentNo")).ToList()));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching applications");
                return BadRequest(Failure(ErrorText.From(ex)));
            }
        }

        /// <summary>
        /// The application as stored in BC. Until the applicant first saves Personal Details, blank
        /// fields are filled from their account profile so they do not retype them.
        /// </summary>
        [HttpGet("application-details")]
        public async Task<IActionResult> ApplicationDetails(string applicationNo)
        {
            try
            {
                var app = await LoadOwnedApplicationAsync(applicationNo);
                if (app == null) return NotFound(Failure("Application not found."));

                var details = (JsonObject)app.Details.DeepClone();
                var saved = !string.IsNullOrWhiteSpace(BcJson.Text(details, "FirstName"));
                details["PersonalDetailsSaved"] = saved;
                details["PhoneNo"] = BcValue.PhoneForDisplay(BcJson.Text(details, "PhoneNo"));
                details["AltPhoneNo"] = BcValue.PhoneForDisplay(BcJson.Text(details, "AltPhoneNo"));
                if (!saved)
                {
                    // Gender is a BC option whose first value is Male, so an unsaved application always
                    // reads "Male". Only offer a gender the applicant actually chose on their profile.
                    details["Gender"] = string.Empty;
                    await PrefillFromProfileAsync(details);
                }
                return Ok(Success(details));
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
                var requirements = string.IsNullOrWhiteSpace(jobId) ? [] : BcJson.List<JobRequirementDto>(await _bc.GetJobRequirementsAsync(jobId));

                var context = new JsonObject
                {
                    ["ApplicationNo"] = applicationNo,
                    ["JobId"] = jobId,
                    ["JobTitle"] = BcJson.Text(app.Details, "JobTitle"),
                    ["RequisitionNo"] = BcJson.Text(app.Details, "RequisitionNo"),
                    ["Status"] = BcJson.Text(app.Details, "Status"),
                    ["Submitted"] = app.Submitted,
                    ["CanEdit"] = !app.Submitted,
                    ["CandidateStatus"] = ApplicationRules.CandidateStatus(BcJson.Text(app.Details, "Status")),
                    ["MinimumReferees"] = _options.MinimumReferees,
                    ["MinimumNextOfKin"] = _options.MinimumNextOfKin,
                    ["MinimumAcademicQualifications"] = _options.MinimumAcademicQualifications,
                    ["JobRequirements"] = new JsonArray(requirements
                        .Select(r => (JsonNode)new JsonObject { ["Code"] = r.Code, ["Description"] = r.Description }).ToArray()),
                    ["DocumentCategories"] = new JsonArray(_options.DocumentCategories
                        .Select(c => (JsonNode)new JsonObject { ["Code"] = c.Code, ["Description"] = c.Description, ["Required"] = c.Required }).ToArray())
                };
                return Ok(Success(context));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading application context for {ApplicationNo}", applicationNo);
                return BadRequest(Failure(ErrorText.From(ex)));
            }
        }

        // ── Section 2: personal details ────────────────────────────────────────

        [HttpPost("update-personal-details")]
        public Task<IActionResult> UpdatePersonalDetails([FromBody] PersonalDetailsUpdateDto request) =>
            EditAsync(request.ApplicationNo, async app =>
            {
                if (request.DateOfBirth is null) return BadRequest(Failure("Date of birth is required."));
                if (request.Gender is not ("Male" or "Female")) return BadRequest(Failure("Select your gender."));

                await _bc.UpdateApplicationPersonalDetailsAsync(
                    request.ApplicationNo, request.Salutation, request.FirstName, request.MiddleName, request.LastName,
                    request.IDPassportNo,
                    Username!, // keep the application's e-mail tied to the signed-in account
                    BcValue.Phone(request.PhoneNo, "Phone number"),
                    BcValue.Phone(request.AltPhoneNo, "Alternative phone number", required: false),
                    request.DateOfBirth.Value, request.Gender, request.MaritalStatus,
                    request.Country, request.CountyCode, request.PostalAddress, request.PostalCode,
                    // Physical impairment is question 5(b) on the KCIC form, saved by update-other-details;
                    // this procedure also writes it, so pass back what is stored.
                    BcJson.Bool(app.Details, "PWD"), BcJson.Text(app.Details, "DisabilityType"), BcJson.Text(app.Details, "PWDNumber"),
                    request.KRAPin, request.Citizenship, request.Nationality,
                    request.AltContactPerson, request.AltContactPhone);
                return Ok(Success(true, "Personal details saved"));
            });

        // ── Sections 3 and 4: current employment / unemployed applicants ───────

        [HttpPost("update-employment")]
        public Task<IActionResult> UpdateEmployment([FromBody] EmploymentUpdateDto request) =>
            EditAsync(request.ApplicationNo, async app =>
            {
                await _bc.UpdateCurrentEmploymentAsync(request.ApplicationNo, request.CurrentWorkplace, request.CurrentPosition,
                    BcValue.Date(request.EffectiveDate), request.CurrentMonthlySalary);
                await _bc.UpdateUnemployedDetailsAsync(request.ApplicationNo,
                    request.IndustrialAttachment, request.IndustrialAttachment ? request.IndustrialAttachmentEmployer : string.Empty,
                    request.IndustrialAttachment ? request.IndustrialAttachmentPeriod : string.Empty,
                    request.InternshipTaken, request.InternshipTaken ? request.InternshipEmployer : string.Empty,
                    request.InternshipTaken ? request.InternshipPeriod : string.Empty, request.DesiredSalary);
                return Ok(Success(true, "Employment details saved"));
            });

        // ── Sections 9 and 10: current duties, abilities and skills ────────────

        [HttpPost("update-duties-abilities")]
        public Task<IActionResult> UpdateDutiesAndAbilities([FromBody] DutiesAbilitiesUpdateDto request) =>
            EditAsync(request.ApplicationNo, async app =>
            {
                await _bc.UpdateCurrentDutiesAsync(request.ApplicationNo, request.CurrentDuties);
                await _bc.UpdateAbilitiesAndSkillsAsync(request.ApplicationNo, request.AbilitiesAndSkills);
                return Ok(Success(true, "Details saved"));
            });

        // ── Section 5 (a–i): other details ─────────────────────────────────────

        [HttpPost("update-other-details")]
        public Task<IActionResult> UpdateOtherDetails([FromBody] OtherDetailsUpdateDto request) =>
            EditAsync(request.ApplicationNo, async app =>
            {
                if (!request.Disabled) { request.DisabilityType = string.Empty; request.PwdNumber = string.Empty; }
                if (!request.InterviewedAtKCIC) { request.KCICPositionApplied = string.Empty; request.KCICInterviewDate = null; }
                if (!request.RelativeAtKCIC) request.RelativeAtKCICDetails = string.Empty;
                if (!request.ConflictOfInterest) request.ConflictOfInterestDetails = string.Empty;
                if (!request.DismissedFromEmployment) { request.DismissalReason = string.Empty; request.DismissalDate = null; }
                if (!request.LitigationLast3Years) request.LitigationDetails = string.Empty;
                if (!request.ConvictedLast3Years) request.ConvictionDetails = string.Empty;

                await _bc.UpdateOtherDetailsAsync(request.ApplicationNo, request);
                return Ok(Success(true, "Details saved"));
            });

        // ── Section 6: academic qualifications ─────────────────────────────────

        [HttpGet("academic-qualifications")]
        public Task<IActionResult> GetAcademicQualifications(string applicationNo) =>
            ReadAsync(applicationNo, async () => BcJson.Array(await _bc.GetAcademicQualificationsAsync(applicationNo)));

        [HttpPost("add-academic-qualification")]
        public Task<IActionResult> AddAcademicQualification([FromBody] AddAcademicQualificationDto request) =>
            EditAsync(request.ApplicationNo, async app =>
            {
                if (request.StartDate is null || request.EndDate is null) return BadRequest(Failure("Enter the start and end dates."));
                await _bc.AddAcademicQualificationAsync(request.ApplicationNo, request.AreaOfStudy, request.Level, request.Institution,
                    request.StartDate.Value, request.EndDate.Value, request.Grade, DateTime.MinValue, request.CourseDescription);
                return Ok(Success(true, "Academic qualification added"));
            });

        [HttpDelete("delete-academic-qualification")]
        public Task<IActionResult> DeleteAcademicQualification(string applicationNo, int lineNo) =>
            EditAsync(applicationNo, async app =>
            {
                var rows = BcJson.Rows(await _bc.GetAcademicQualificationsAsync(applicationNo));
                if (!rows.Any(r => BcJson.Text(r, "lineNo") == lineNo.ToString())) return NotFound(Failure("Qualification not found on this application."));
                await _bc.DeleteAcademicQualificationAsync(applicationNo, lineNo);
                return Ok(Success(true, "Academic qualification removed"));
            });

        // ── Section 7: professional training ───────────────────────────────────

        [HttpGet("professional-training")]
        public Task<IActionResult> GetProfessionalTraining(string applicationNo) =>
            ReadAsync(applicationNo, async () => BcJson.Array(await _bc.GetProfessionalQualificationsAsync(applicationNo)));

        [HttpPost("add-professional-training")]
        public Task<IActionResult> AddProfessionalTraining([FromBody] AddProfessionalTrainingDto request) =>
            EditAsync(request.ApplicationNo, async app =>
            {
                await _bc.InsertProfessionalQualificationAsync(request.ApplicationNo, request.Description, request.Institution,
                    request.Year, request.ProfessionalMembership, request.TrainingDescription);
                return Ok(Success(true, "Professional training added"));
            });

        [HttpDelete("delete-professional-training")]
        public Task<IActionResult> DeleteProfessionalTraining(string applicationNo, int lineNo) =>
            EditAsync(applicationNo, async app =>
            {
                var rows = BcJson.Rows(await _bc.GetProfessionalQualificationsAsync(applicationNo));
                if (!rows.Any(r => BcJson.Text(r, "lineNo") == lineNo.ToString())) return NotFound(Failure("Training record not found on this application."));
                await _bc.DeleteProfessionalQualificationAsync(applicationNo, lineNo);
                return Ok(Success(true, "Professional training removed"));
            });

        // ── Section 8: work experience ─────────────────────────────────────────

        [HttpGet("work-experience")]
        public Task<IActionResult> GetWorkExperience(string applicationNo) =>
            ReadAsync(applicationNo, async () => BcJson.Array(await _bc.GetWorkExperienceAsync(applicationNo)));

        [HttpPost("add-work-experience")]
        public Task<IActionResult> AddWorkExperience([FromBody] AddWorkExperienceDto request) =>
            EditAsync(request.ApplicationNo, async app =>
            {
                if (request.StartDate is null) return BadRequest(Failure("Enter the start date."));
                await _bc.InsertWorkExperienceAsync(request.ApplicationNo, request.Position, request.Institution, request.StartDate.Value,
                    request.IsCurrent ? DateTime.MinValue : BcValue.Date(request.EndDate), request.Responsibility, request.IsCurrent, request.Salary);
                return Ok(Success(true, "Work experience added"));
            });

        [HttpDelete("delete-work-experience")]
        public Task<IActionResult> DeleteWorkExperience(string applicationNo, int lineNo) =>
            EditAsync(applicationNo, async app =>
            {
                var rows = BcJson.Rows(await _bc.GetWorkExperienceAsync(applicationNo));
                if (!rows.Any(r => BcJson.Text(r, "lineNo") == lineNo.ToString())) return NotFound(Failure("Work experience not found on this application."));
                await _bc.RemoveWorkExperienceAsync(lineNo, applicationNo);
                return Ok(Success(true, "Work experience removed"));
            });

        // ── Next of kin ────────────────────────────────────────────────────────

        [HttpGet("next-of-kin")]
        public Task<IActionResult> GetNextOfKin(string applicationNo) =>
            ReadAsync(applicationNo, () => LoadNextOfKinAsync(applicationNo));

        [HttpPost("add-next-of-kin")]
        public Task<IActionResult> AddNextOfKin([FromBody] AddNextOfKinDto request) =>
            EditAsync(request.ApplicationNo, async app =>
            {
                var phone = BcValue.Phone(request.PhoneNo, "Phone number");
                await _bc.InsertRelationshipsAsync("Next of Kin", request.ApplicationNo, request.FirstName, request.MiddleName,
                    request.LastName, phone, request.Email, request.Relationship, request.Institution);
                return Ok(Success(true, "Next of kin added"));
            });

        [HttpDelete("delete-next-of-kin")]
        public Task<IActionResult> DeleteNextOfKin(string applicationNo, string id) =>
            EditAsync(applicationNo, async app =>
            {
                // RemoveRelationship deletes by id alone, so only accept ids listed on this application.
                if (!(await LoadNextOfKinAsync(applicationNo)).Any(r => BcJson.Text(r, "id") == id))
                    return NotFound(Failure("Next of kin not found on this application."));
                await _bc.RemoveRelationshipAsync(id);
                return Ok(Success(true, "Next of kin removed"));
            });

        // ── Section 11: referees ───────────────────────────────────────────────

        [HttpGet("referees")]
        public Task<IActionResult> GetReferees(string applicationNo) =>
            ReadAsync(applicationNo, () => LoadRefereesAsync(applicationNo));

        [HttpPost("add-referee")]
        public Task<IActionResult> AddReferee([FromBody] AddRefereeDto request) =>
            EditAsync(request.ApplicationNo, async app =>
            {
                var phone = BcValue.Phone(request.PhoneNo, "Phone number");
                // Referees are keyed by full name in BC, so the same name cannot be added twice.
                var fullName = string.Join(' ', new[] { request.FirstName, request.MiddleName, request.LastName }
                    .Select(n => n.Trim()).Where(n => n.Length > 0));
                if ((await LoadRefereesAsync(request.ApplicationNo)).Any(r => string.Equals(BcJson.Text(r, "names"), fullName, StringComparison.OrdinalIgnoreCase)))
                    return BadRequest(Failure($"{fullName} is already one of your referees."));

                await _bc.InsertApplicationRefereeAsync(request.ApplicationNo, request.FirstName, request.MiddleName, request.LastName,
                    phone, request.Email, request.Institution, request.Address, request.PeriodKnown, request.Occupation);
                return Ok(Success(true, "Referee added"));
            });

        [HttpDelete("delete-referee")]
        public Task<IActionResult> DeleteReferee(string applicationNo, string id) =>
            EditAsync(applicationNo, async app =>
            {
                if (!(await LoadRefereesAsync(applicationNo)).Any(r => BcJson.Text(r, "id") == id))
                    return NotFound(Failure("Referee not found on this application."));
                await _bc.RemoveRelationshipAsync(id);
                return Ok(Success(true, "Referee removed"));
            });

        // ── Documents ──────────────────────────────────────────────────────────

        [HttpGet("attached-documents")]
        public Task<IActionResult> GetAttachedDocuments(string applicationNo) =>
            ReadAsync(applicationNo, () => LoadDocumentsAsync(applicationNo));

        [HttpPost("upload-document")]
        [RequestSizeLimit(10 * 1024 * 1024)]
        public Task<IActionResult> UploadDocument([FromBody] UploadAttachmentDto request) =>
            EditAsync(request.ApplicationNo, async app =>
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

                await _bc.UploadDocumentAsync(request.ApplicationNo, stem + ".pdf", request.Attachment, ApplicationRules.JobApplicationsTableId, 0);
                return Ok(Success(true, "Document uploaded"));
            });

        [HttpDelete("delete-document")]
        public Task<IActionResult> DeleteDocument(string id, string applicationNo) =>
            EditAsync(applicationNo, async app =>
            {
                var documents = await LoadDocumentsAsync(applicationNo);
                if (!documents.Any(d => d.Id == id)) return NotFound(Failure("Document not found on this application."));
                await _bc.RemoveDocumentAsync(id);
                return Ok(Success(true, "Document removed"));
            });

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
        public Task<IActionResult> SubmitFinalApplication(string applicationNo) =>
            EditAsync(applicationNo, async app =>
            {
                var missing = await MissingItemsAsync(applicationNo, app.Details);
                if (missing.Count > 0)
                    return BadRequest(new ApiResponse<List<string>> { Success = false, Message = "Complete the following before submitting: " + string.Join(" ", missing), Data = missing });

                await _bc.SubmitApplicationAsync(applicationNo);
                if (!await _bc.IsApplicationSubmittedAsync(applicationNo))
                    return BadRequest(Failure("Business Central did not confirm the submission. Please try again."));
                return Ok(Success(true, "Application submitted"));
            });

        // ── Helpers ────────────────────────────────────────────────────────────

        private sealed record OwnedApplication(JsonObject Details, bool Submitted);

        private async Task<List<JobDto>> LoadAdvertisedJobsAsync() => BcJson.List<JobDto>(await _bc.GetAdvertisedJobsAsync());

        /// <summary>Loads the application only if it belongs to the signed-in applicant.</summary>
        private async Task<OwnedApplication?> LoadOwnedApplicationAsync(string applicationNo)
        {
            var username = Username;
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(applicationNo)) return null;

            JsonObject? details;
            try { details = BcJson.Object(await _bc.GetJobApplicationDetailsAsync(applicationNo)); }
            catch (BusinessCentralException ex) when (ex.Message.Contains("not found", StringComparison.OrdinalIgnoreCase)) { return null; }

            if (details == null || !string.Equals(BcJson.Text(details, "Email"), username, StringComparison.OrdinalIgnoreCase))
                return null;

            var status = BcJson.Text(details, "Status");
            var submitted = ApplicationRules.IsSubmitted(status);
            details["Submitted"] = submitted;
            details["CandidateStatus"] = ApplicationRules.CandidateStatus(status);
            return new OwnedApplication(details, submitted);
        }

        /// <summary>Copies the applicant's account profile into blank application fields.</summary>
        private async Task PrefillFromProfileAsync(JsonObject details)
        {
            JsonObject? profile;
            try { profile = BcJson.Object(await _bc.GetUserDetailsAsync(Username!)); }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not load profile to prefill application");
                return;
            }
            if (profile == null) return;

            void Fill(string target, string source, string? value = null)
            {
                if (string.IsNullOrWhiteSpace(BcJson.Text(details, target)))
                    details[target] = value ?? BcJson.Text(profile, source);
            }

            Fill("FirstName", "FirstName");
            Fill("MiddleName", "MiddleName");
            Fill("LastName", "LastName");
            Fill("IDPassportNo", "IDNumber");
            Fill("Salutation", "Initials");
            Fill("PhoneNo", "TelephoneNo", BcValue.PhoneForDisplay(BcJson.Text(profile, "TelephoneNo")));
            Fill("MaritalStatus", "MaritalStatus");
            Fill("Address", "PostalAddress");
            Fill("PostalCode", "PostCode");
            Fill("DateOfBirth", "DateOfBirth");
            Fill("Country", "Country");
            // A profile with a birth date has been filled in by the applicant, so its gender is a real choice.
            if (!string.IsNullOrWhiteSpace(BcJson.Text(profile, "DateOfBirth"))) Fill("Gender", "Gender");
            if (BcJson.Bool(profile, "Disability"))
            {
                details["PWD"] = true;
                Fill("DisabilityType", "DisabilityStatus");
                Fill("PWDNumber", "PwdNumber");
            }
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
            catch (PortalValidationException ex)
            {
                return BadRequest(Failure(ex.Message));
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

        private async Task<List<JsonObject>> LoadNextOfKinAsync(string applicationNo) =>
            BcJson.Rows(await _bc.GetRelationshipsAsync(applicationNo))
                .Where(r => BcJson.Text(r, "type") == "Next of Kin")
                .Select(r => WithNamesAndPhone(r, BcJson.Text(r, "firstName"), BcJson.Text(r, "lastName")))
                .ToList();

        private async Task<List<JsonObject>> LoadRefereesAsync(string applicationNo) =>
            BcJson.Rows(await _bc.GetListofApplicationRefereesAsync(applicationNo))
                .Select(r => WithNamesAndPhone(r, BcJson.Text(r, "firstName"), BcJson.Text(r, "lastName")))
                .ToList();

        private static JsonObject WithNamesAndPhone(JsonObject row, string first, string last)
        {
            row["names"] = string.Join(' ', new[] { first, last }.Where(n => n.Length > 0));
            row["phoneNo"] = BcValue.PhoneForDisplay(BcJson.Text(row, "phoneNo"));
            return row;
        }

        private async Task<List<AttachmentDto>> LoadDocumentsAsync(string applicationNo) =>
            BcJson.Rows(await _bc.GetAttachedDocumentsAsync(applicationNo)).Select(row =>
            {
                var (code, name) = ApplicationRules.ParseFileName(BcJson.Text(row, "fileName"), _options.DocumentCategories);
                var extension = BcJson.Text(row, "fileExtension");
                return new AttachmentDto
                {
                    Id = BcJson.Text(row, "id"),
                    FileName = name,
                    FileExtension = string.IsNullOrWhiteSpace(extension) ? "pdf" : extension,
                    RequirementCode = code,
                    DocumentType = _options.DocumentCategories.FirstOrDefault(c => c.Code == code)?.Description ?? "Other",
                    DocumentDate = BcJson.Text(row, "documentDate")
                };
            }).ToList();

        private async Task<List<string>> MissingItemsAsync(string applicationNo, JsonObject details)
        {
            var missing = new List<string>();

            if (string.IsNullOrWhiteSpace(BcJson.Text(details, "FirstName")))
                missing.Add("Save your Personal Details.");
            else
            {
                foreach (var (key, label) in new[]
                {
                    ("IDPassportNo", "ID / passport number"), ("PhoneNo", "phone number"), ("DateOfBirth", "date of birth"),
                    ("Nationality", "nationality"), ("Address", "address")
                })
                {
                    // BC stores a blank phone number as "0".
                    var value = key == "PhoneNo" ? BcValue.PhoneForDisplay(BcJson.Text(details, key)) : BcJson.Text(details, key);
                    if (string.IsNullOrWhiteSpace(value)) missing.Add($"Add your {label} in Personal Details.");
                }
            }

            if (string.IsNullOrWhiteSpace(BcJson.Text(details, "LanguagesProficientIn")))
                missing.Add("Answer the Other Details questions (section 5).");
            if (string.IsNullOrWhiteSpace(BcJson.Text(details, "AbilitiesAndSkills")))
                missing.Add("Describe your abilities, skills and experience (section 10).");

            var openAdverts = await LoadAdvertisedJobsAsync();
            if (!openAdverts.Any(j => j.DocumentNo == BcJson.Text(details, "RequisitionNo")))
                missing.Add("This advert has closed and no longer accepts submissions.");

            var academicTask = _bc.GetAcademicQualificationsAsync(applicationNo);
            var kinTask = LoadNextOfKinAsync(applicationNo);
            var refereesTask = LoadRefereesAsync(applicationNo);
            var documentsTask = LoadDocumentsAsync(applicationNo);
            await Task.WhenAll(academicTask, kinTask, refereesTask, documentsTask);

            var academicCount = BcJson.Array(academicTask.Result).Count;
            if (academicCount < _options.MinimumAcademicQualifications)
                missing.Add($"Add at least {_options.MinimumAcademicQualifications} academic qualification(s).");

            var kinCount = kinTask.Result.Count;
            if (kinCount < _options.MinimumNextOfKin)
                missing.Add($"Add at least {_options.MinimumNextOfKin} next of kin.");

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
