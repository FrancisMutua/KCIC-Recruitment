using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using NAVWS;
using System.Text.Json;
using Recruitment.Server.Interfaces;
using Recruitment.Server.DTOs;
using Recruitment.Server.Models;

namespace Recruitment.Server.Controllers
{
    [ApiController]
    [Route("/api/job")]
    public class JobController(IWebService webService, ILogger<JobController> logger) : Controller
    {
        private readonly Recruitment_PortClient _webportals = webService.ObjNav();
        private readonly ILogger<JobController> _logger = logger;

        [HttpGet("advertisedjobs")]
        public async Task<IActionResult> AdvertisedJobs()
        {
            try
            {
                var response = await _webportals.GetAdvertisedJobsAsync();
                var result = response.return_value;
                
                _logger.LogInformation($"Raw AdvertisedJobs response from NAV: {result}");

                if (string.IsNullOrEmpty(result))
                {
                     return Ok(new ApiResponse<List<JobDto>> { Success = true, Data = new List<JobDto>() });
                }

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var jsonData = JsonSerializer.Deserialize<List<JobDto>>(result, options) ?? [];
                return Ok(new ApiResponse<List<JobDto>> { Success = true, Data = jsonData });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching advertised jobs");
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to load advertised jobs. Please try again later." });
            }
        }

        [HttpGet("jobrequirements")]
        public async Task<IActionResult> JobRequirements(string jobId, string? requisitionNo = null)
        {
            try
            {
                if (string.IsNullOrEmpty(jobId))
                {
                    return BadRequest(new ApiResponse<object> { Success = false, Message = "Job ID is required." });
                }

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                // Fetch Requirements
                var reqResponse = await _webportals.GetJobRequirementsAsync(jobId);
                var reqResult = reqResponse.return_value;
                var requirements = !string.IsNullOrEmpty(reqResult) 
                    ? JsonSerializer.Deserialize<List<JobRequirementDto>>(reqResult, options) 
                    : new List<JobRequirementDto>();

                // Fetch Responsibilities
                var respResponse = await _webportals.GetJobResponsibilitiesAsync(jobId);
                var respResult = respResponse.return_value;
                var responsibilities = !string.IsNullOrEmpty(respResult) 
                    ? JsonSerializer.Deserialize<List<JobResponsibilityDto>>(respResult, options) 
                    : new List<JobResponsibilityDto>();

                // Fetch Job Info (to get Requisition No / Document No)
                var jobsResponse = await _webportals.GetAdvertisedJobsAsync();
                var jobsResult = jobsResponse.return_value;
                var jobs = !string.IsNullOrEmpty(jobsResult)
                    ? JsonSerializer.Deserialize<List<JobDto>>(jobsResult, options)
                    : [];

                var jobInfo = jobs?.FirstOrDefault(j => j.JobId == jobId && (string.IsNullOrEmpty(requisitionNo) || j.DocumentNo == requisitionNo));
                if (jobInfo == null) return NotFound(new ApiResponse<object> { Success = false, Message = "This advert is no longer available." });
                var advertRequirements = await _webportals.GetMinimumRequirementsAsync(jobInfo.DocumentNo);
                if (!string.IsNullOrWhiteSpace(advertRequirements.return_value))
                    requirements = JsonSerializer.Deserialize<List<JobRequirementDto>>(advertRequirements.return_value, options);

                var jobDetails = new JobDetailsDto
                {
                    Requirements = requirements ?? new List<JobRequirementDto>(),
                    Responsibilities = responsibilities ?? new List<JobResponsibilityDto>(),
                    JobInfo = jobInfo ?? new JobDto()
                };

                return Ok(new ApiResponse<JobDetailsDto> { Success = true, Data = jobDetails });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching job details for {JobId}", jobId);
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to load job requirements. Please try again later." });
            }
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitApplication([FromBody] SubmitApplicationDto request)
        {
            try
            {
                if (request == null) return BadRequest("Invalid request");

                var response = await _webportals.SubmitJobApplicationAsync(request.Username, request.RequisitionNo, request.JobId);
                var result = response.return_value;

                return Ok(new ApiResponse<string> { Success = true, Message = "Application draft created", Data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting application");
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to initiate application process. Please try again later." });
            }
        }

        [HttpGet("application-details")]
        public async Task<IActionResult> ApplicationDetails(string applicationNo)
        {
            try
            {
                if (string.IsNullOrEmpty(applicationNo)) return BadRequest("Application No is required");

                var response = await _webportals.GetJobApplicationDetailsAsync(applicationNo);
                var result = response.return_value;
                
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var data = JsonSerializer.Deserialize<object>(result, options);

                return Ok(new ApiResponse<object> { Success = true, Data = data ?? new object() });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching application details");
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to load application details." });
            }
        }

        [HttpGet("applications")]
        public async Task<IActionResult> GetApplications()
        {
            try
            {
                // Get the username from context
                var username = User.Claims.FirstOrDefault(x => x.Type == "username")?.Value;
                if (string.IsNullOrEmpty(username)) return Unauthorized(new ApiResponse<object> { Success = false, Message = "User not found!" });

                var response = await _webportals.GetApplicationsAsync(username);
                var result = response.return_value;

                if (string.IsNullOrEmpty(result))
                {
                    return Ok(new ApiResponse<List<object>> { Success = true, Data = new List<object>() });
                }

                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var data = JsonSerializer.Deserialize<List<object>>(result, options);

                return Ok(new ApiResponse<List<object>> { Success = true, Data = data ?? new List<object>() });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching user applications");
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to load your applications." });
            }
        }

        [HttpPost("update-personal-details")]
        public async Task<IActionResult> UpdatePersonalDetails([FromBody] PersonalDetailsUpdateDto request)
        {
            try
            {
                if (request == null) return BadRequest("Invalid request");
                if (!await IsApplicationEditableAsync(request.ApplicationNo))
                    return BadRequest(new ApiResponse<object> { Success = false, Message = "Modifications are not allowed for submitted applications." });

                int.TryParse(request.PhoneNo, out int phoneNo);
                int.TryParse(request.AltPhoneNo, out int altPhoneNo);
                static string SafeString(string? value) => value ?? string.Empty;

                var response = await _webportals.UpdateApplicationPersonalDetailsAsync(
                    SafeString(request.ApplicationNo),
                    SafeString(request.Salutation),
                    SafeString(request.FirstName),
                    SafeString(request.MiddleName),
                    SafeString(request.LastName),
                    SafeString(request.IDPassportNo),
                    SafeString(request.Email),
                    phoneNo,
                    altPhoneNo,
                    request.DateOfBirth,
                    ((int)request.Gender).ToString(),
                    ((int)request.MaritalStatus).ToString(),
                    SafeString(request.Country),
                    SafeString(request.CountyCode),
                    SafeString(request.SubCountyCode),
                    SafeString(request.WardCode),
                    SafeString(request.PostalAddress),
                    SafeString(request.PostalCode),
                    request.Disability,
                    SafeString(request.DisabilityType),
                    SafeString(request.PWDNumber),
                    SafeString(request.KRAPin),
                    SafeString(request.Citizenship),
                    SafeString(request.Ethnicity),
                    request.CurrentSalary,
                    request.ExpectedSalary,
                    SafeString(request.NoticePeriod)
                );

                if (response.return_value)
                {
                    return Ok(new ApiResponse<bool> { Success = true, Message = "Personal details updated successfully", Data = true });
                }
                else
                {
                    return BadRequest(new ApiResponse<bool> { Success = false, Message = "Failed to update personal details in NAV", Data = false });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating personal details for {ApplicationNo}", request?.ApplicationNo);
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to update personal details. Please ensure all required fields are valid." });
            }
        }

        [HttpGet("academic-qualifications")]
        public async Task<IActionResult> GetAcademicQualifications(string applicationNo)
        {
            try
            {
                if (string.IsNullOrEmpty(applicationNo)) return BadRequest("Application No is required");

                var response = await _webportals.GetAcademicQualificationDetailsAsync(applicationNo);
                var result = response.return_value;

                if (string.IsNullOrEmpty(result))
                {
                    return Ok(new ApiResponse<List<AcademicQualificationDto>> { Success = true, Data = new List<AcademicQualificationDto>() });
                }

                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var data = JsonSerializer.Deserialize<List<AcademicQualificationDto>>(result, options) ?? [];

                return Ok(new ApiResponse<List<AcademicQualificationDto>> { Success = true, Data = data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching academic qualifications for {ApplicationNo}", applicationNo);
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to load academic qualifications." });
            }
        }

        [HttpPost("add-academic-qualification")]
        public async Task<IActionResult> AddAcademicQualification([FromBody] AddAcademicQualificationDto request)
        {
            try
            {
                if (request == null) return BadRequest("Invalid request");
                if (!await IsApplicationEditableAsync(request.ApplicationNo))
                    return BadRequest(new ApiResponse<object> { Success = false, Message = "Modifications are not allowed for submitted applications." });

                await _webportals.ManageRecruitmentApplicationAsync(request.ApplicationNo, "add-qualification", JsonSerializer.Serialize(request));
                return Ok(new ApiResponse<bool> { Success = true, Message = "Academic qualification added successfully", Data = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding academic qualification for {ApplicationNo}", request?.ApplicationNo);
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to add academic qualification. Please check your inputs." });
            }
        }

        [HttpDelete("delete-academic-qualification")]
        public async Task<IActionResult> DeleteAcademicQualification(string applicationNo, int lineNo)
        {
            try
            {
                if (string.IsNullOrEmpty(applicationNo)) return BadRequest("Application No is required");
                if (!await IsApplicationEditableAsync(applicationNo))
                    return BadRequest(new ApiResponse<object> { Success = false, Message = "Modifications are not allowed for submitted applications." });

                var response = await _webportals.DeleteAcademicQualificationAsync(applicationNo, lineNo);

                if (response.return_value)
                {
                    return Ok(new ApiResponse<bool> { Success = true, Message = "Academic qualification deleted successfully", Data = true });
                }
                else
                {
                    return BadRequest(new ApiResponse<bool> { Success = false, Message = "Failed to delete academic qualification in NAV", Data = false });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting academic qualification for {ApplicationNo}", applicationNo);
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to delete academic qualification." });
            }
        }

        [HttpGet("work-experience")]
        public async Task<IActionResult> GetWorkExperience(string applicationNo)
        {
            try
            {
                if (string.IsNullOrEmpty(applicationNo)) return BadRequest("Application No is required");

                var response = await _webportals.GetWorkExperienceAsync(applicationNo);
                var result = response.return_value;

                if (string.IsNullOrEmpty(result))
                {
                    return Ok(new ApiResponse<List<WorkExperienceDto>> { Success = true, Data = new List<WorkExperienceDto>() });
                }

                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var data = JsonSerializer.Deserialize<List<WorkExperienceDto>>(result, options) ?? [];

                return Ok(new ApiResponse<List<WorkExperienceDto>> { Success = true, Data = data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching work experience for {ApplicationNo}", applicationNo);
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to load work experience history." });
            }
        }

        [HttpPost("add-work-experience")]
        public async Task<IActionResult> AddWorkExperience([FromBody] AddWorkExperienceDto request)
        {
            try
            {
                if (request == null) return BadRequest("Invalid request");
                if (!await IsApplicationEditableAsync(request.ApplicationNo))
                    return BadRequest(new ApiResponse<object> { Success = false, Message = "Modifications are not allowed for submitted applications." });

                await _webportals.InsertWorkExperienceAsync(
                    request.ApplicationNo,
                    request.Position,
                    request.Institution,
                    request.StartDate,
                    request.EndDate,
                    request.Responsibility,
                    request.IsCurrent
                );

                return Ok(new ApiResponse<bool> { Success = true, Message = "Work experience added successfully", Data = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding work experience for {ApplicationNo}", request?.ApplicationNo);
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to add work experience. Please check your inputs." });
            }
        }

        [HttpDelete("delete-work-experience")]
        public async Task<IActionResult> DeleteWorkExperience(int lineNo, string applicationNo)
        {
            try
            {
                if (string.IsNullOrEmpty(applicationNo)) return BadRequest("Application No is required");
                if (!await IsApplicationEditableAsync(applicationNo))
                    return BadRequest(new ApiResponse<object> { Success = false, Message = "Modifications are not allowed for submitted applications." });

                await _webportals.RemoveWorkExperienceAsync(lineNo, applicationNo);
                return Ok(new ApiResponse<bool> { Success = true, Message = "Work experience deleted successfully", Data = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting work experience for {ApplicationNo}", applicationNo);
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to delete work experience." });
            }
        }

        // ─── Professional Training ───────────────────────────────────────────────

        [HttpGet("professional-training")]
        public async Task<IActionResult> GetProfessionalTraining(string applicationNo)
        {
            try
            {
                if (string.IsNullOrEmpty(applicationNo)) return BadRequest("Application No is required");

                var response = await _webportals.GetProfessionalQualificationsAsync(applicationNo);
                var result = response.return_value;

                if (string.IsNullOrEmpty(result))
                    return Ok(new ApiResponse<List<ProfessionalTrainingDto>> { Success = true, Data = new List<ProfessionalTrainingDto>() });

                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var data = JsonSerializer.Deserialize<List<ProfessionalTrainingDto>>(result, options) ?? [];

                return Ok(new ApiResponse<List<ProfessionalTrainingDto>> { Success = true, Data = data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching professional training for {ApplicationNo}", applicationNo);
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to load professional training records." });
            }
        }

        [HttpPost("add-professional-training")]
        public async Task<IActionResult> AddProfessionalTraining([FromBody] AddProfessionalTrainingDto request)
        {
            try
            {
                if (request == null) return BadRequest("Invalid request");
                if (!await IsApplicationEditableAsync(request.ApplicationNo))
                    return BadRequest(new ApiResponse<object> { Success = false, Message = "Modifications are not allowed for submitted applications." });

                await _webportals.InsertProfessionalQualificationAsync(
                    request.ApplicationNo,
                    request.Description,
                    request.Institution,
                    request.Year,
                    request.ProfessionalMembership,
                    request.TrainingDescription
                );

                return Ok(new ApiResponse<bool> { Success = true, Message = "Professional training added successfully", Data = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding professional training for {ApplicationNo}", request?.ApplicationNo);
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to add professional training. Please check your inputs." });
            }
        }

        [HttpDelete("delete-professional-training")]
        public async Task<IActionResult> DeleteProfessionalTraining(int lineNo, string applicationNo)
        {
            try
            {
                if (string.IsNullOrEmpty(applicationNo)) return BadRequest("Application No is required");
                if (!await IsApplicationEditableAsync(applicationNo))
                    return BadRequest(new ApiResponse<object> { Success = false, Message = "Modifications are not allowed for submitted applications." });

                await _webportals.DeleteProfessionalQualificationAsync(applicationNo, lineNo);
                return Ok(new ApiResponse<bool> { Success = true, Message = "Professional training deleted successfully", Data = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting professional training for {ApplicationNo}", applicationNo);
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to delete professional training." });
            }
        }


        [HttpGet("relationships")]
        public async Task<IActionResult> GetRelationships(string applicationNo)
        {
            try
            {
                if (string.IsNullOrEmpty(applicationNo)) return BadRequest("Application No is required");

                var response = await _webportals.GetRelationshipsAsync(applicationNo);
                var result = response.return_value;

                if (string.IsNullOrEmpty(result))
                {
                    return Ok(new ApiResponse<List<RelationshipDto>> { Success = true, Data = new List<RelationshipDto>() });
                }

                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var data = JsonSerializer.Deserialize<List<RelationshipDto>>(result, options) ?? [];

                return Ok(new ApiResponse<List<RelationshipDto>> { Success = true, Data = data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching relationships for {ApplicationNo}", applicationNo);
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to load contact records." });
            }
        }

        [HttpPost("add-relationship")]
        public async Task<IActionResult> AddRelationship([FromBody] AddRelationshipDto request)
        {
            try
            {
                if (request == null) return BadRequest("Invalid request");
                if (!await IsApplicationEditableAsync(request.ApplicationNo))
                    return BadRequest(new ApiResponse<object> { Success = false, Message = "Modifications are not allowed for submitted applications." });

                await _webportals.InsertRelationshipsAsync(
                    request.Type,
                    request.ApplicationNo,
                    request.FirstName,
                    request.MiddleName,
                    request.LastName,
                    request.PhoneNo,
                    request.Email,
                    request.Relationship,
                    request.Institution
                );

                return Ok(new ApiResponse<bool> { Success = true, Message = $"{request.Type} added successfully", Data = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding relationship for {ApplicationNo}", request?.ApplicationNo);
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to add record. Please check your inputs." });
            }
        }

        [HttpDelete("delete-relationship")]
        public async Task<IActionResult> DeleteRelationship(string id, string applicationNo)
        {
            try
            {
                if (string.IsNullOrEmpty(id)) return BadRequest("Id is required");
                if (!await IsApplicationEditableAsync(applicationNo))
                    return BadRequest(new ApiResponse<object> { Success = false, Message = "Modifications are not allowed for submitted applications." });

                await _webportals.RemoveRelationshipAsync(id);

                return Ok(new ApiResponse<bool> { Success = true, Message = "Relationship deleted successfully", Data = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting relationship {Id}", id);
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to delete record." });
            }
        }


        [HttpGet("referees")]
        public async Task<IActionResult> GetReferees(string applicationNo)
        {
            try
            {
                var response = await _webportals.GetListofApplicationRefereesAsync(applicationNo);
                var result = response.return_value;

                if (string.IsNullOrEmpty(result))
                {
                    return Ok(new ApiResponse<List<RelationshipDto>> { Success = true, Data = new List<RelationshipDto>() });
                }

                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var data = JsonSerializer.Deserialize<List<RelationshipDto>>(result, options) ?? [];

                return Ok(new ApiResponse<List<RelationshipDto>> { Success = true, Data = data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching referees for {ApplicationNo}", applicationNo);
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to load referee details." });
            }
        }

        [HttpPost("add-referee")]
        public async Task<IActionResult> AddReferee([FromBody] AddRelationshipDto request)
        {
            try
            {
                if (request == null) return BadRequest("Invalid request");
                if (!await IsApplicationEditableAsync(request.ApplicationNo))
                    return BadRequest(new ApiResponse<object> { Success = false, Message = "Modifications are not allowed for submitted applications." });

                await _webportals.InsertApplicationRefereeAsync(
                    request.ApplicationNo,
                    request.FirstName,
                    request.MiddleName,
                    request.LastName,
                    request.PhoneNo,
                    request.Email,
                    request.Institution
                );

                return Ok(new ApiResponse<bool> { Success = true, Message = "Referee added successfully", Data = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding referee for {ApplicationNo}", request?.ApplicationNo);
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to add referee. Please check your inputs." });
            }
        }

        [HttpDelete("delete-referee")]
        public async Task<IActionResult> DeleteReferee(int lineNo, string applicationNo)
        {
            try
            {
                if (string.IsNullOrEmpty(applicationNo)) return BadRequest("Application No is required");
                if (!await IsApplicationEditableAsync(applicationNo))
                    return BadRequest(new ApiResponse<object> { Success = false, Message = "Modifications are not allowed for submitted applications." });

                await _webportals.DeleteApplicationRefereeAsync(applicationNo, lineNo);

                return Ok(new ApiResponse<bool> { Success = true, Message = "Referee deleted successfully", Data = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting referee for {ApplicationNo}", applicationNo);
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to delete referee." });
            }
        }
        [HttpGet("attached-documents")]
        public async Task<IActionResult> GetAttachedDocuments(string applicationNo)
        {
            try
            {
                if (string.IsNullOrEmpty(applicationNo)) return BadRequest("Application No is required");

                var response = await _webportals.GetAttachedDocumentsAsync(applicationNo);
                var result = response.return_value;

                if (string.IsNullOrEmpty(result))
                {
                    return Ok(new ApiResponse<List<AttachmentDto>> { Success = true, Data = new List<AttachmentDto>() });
                }

                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var data = JsonSerializer.Deserialize<List<AttachmentDto>>(result, options) ?? [];

                return Ok(new ApiResponse<List<AttachmentDto>> { Success = true, Data = data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching attached documents for {ApplicationNo}", applicationNo);
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to load attached documents." });
            }
        }

        [HttpPost("upload-document")]
        public async Task<IActionResult> UploadDocument([FromBody] UploadAttachmentDto request)
        {
            try
            {
                if (!await OwnsApplicationAsync(request.ApplicationNo)) return Forbid();
                await _webportals.ManageRecruitmentApplicationAsync(request.ApplicationNo, "upload-document", JsonSerializer.Serialize(request));
                return Ok(new ApiResponse<bool> { Success = true, Message = "Document uploaded successfully", Data = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading recruitment document");
                return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
        }

        [HttpDelete("delete-document")]
        public async Task<IActionResult> DeleteDocument(string id, string applicationNo)
        {
            try
            {
                if (string.IsNullOrEmpty(id)) return BadRequest("Id is required");
                if (!await IsApplicationEditableAsync(applicationNo))
                    return BadRequest(new ApiResponse<object> { Success = false, Message = "Modifications are not allowed for submitted applications." });

                await _webportals.RemoveDocumentAsync(id);

                return Ok(new ApiResponse<bool> { Success = true, Message = "Document deleted successfully", Data = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting document {Id}", id);
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to delete document." });
            }
        }

        [HttpPost("submit-application")]
        public async Task<IActionResult> SubmitFinalApplication(string applicationNo)
        {
            try
            {
                if (!await OwnsApplicationAsync(applicationNo)) return Forbid();

                await _webportals.SubmitApplicationAsync(applicationNo);

                return Ok(new ApiResponse<bool> { Success = true, Message = "Application submitted successfully", Data = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting final application {ApplicationNo}", applicationNo);
                return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
        }

        [HttpGet("application-context")]
        public async Task<IActionResult> RecruitmentContext(string applicationNo)
        {
            try
            {
                if (!await OwnsApplicationAsync(applicationNo)) return Forbid();
                var response = await _webportals.GetApplicationInstructionsAsync(applicationNo);
                return Ok(new ApiResponse<object> { Success = true, Data = JsonSerializer.Deserialize<object>(response.return_value) });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading recruitment context");
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Could not load application requirements. Please try again." });
            }
        }

        [HttpPost("application-action")]
        public async Task<IActionResult> RecruitmentAction([FromBody] RecruitmentActionDto request)
        {
            try
            {
                if (!await OwnsApplicationAsync(request.ApplicationNo)) return Forbid();
                var response = await _webportals.ManageRecruitmentApplicationAsync(request.ApplicationNo, request.Action, request.Data.ValueKind == JsonValueKind.Undefined ? "{}" : request.Data.GetRawText());
                return Ok(new ApiResponse<object> { Success = true, Data = JsonSerializer.Deserialize<object>(response.return_value) });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing recruitment action {Action}", request.Action);
                return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
        }

        [HttpPost("accept-offer")]
        public async Task<IActionResult> AcceptOffer(string applicationNo)
        {
            try
            {
                if (!await OwnsApplicationAsync(applicationNo)) return Forbid();
                var response = await _webportals.AcceptOfferAsync(applicationNo);
                return Ok(new ApiResponse<bool> { Success = response.return_value, Data = response.return_value });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
        }

        private async Task<bool> OwnsApplicationAsync(string applicationNo)
        {
            var username = User.Claims.FirstOrDefault(x => x.Type == "username")?.Value;
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(applicationNo)) return false;
            var response = await _webportals.GetJobApplicationDetailsAsync(applicationNo);
            if (string.IsNullOrWhiteSpace(response.return_value)) return false;
            using var document = JsonDocument.Parse(response.return_value);
            return document.RootElement.TryGetProperty("Email", out var email) && string.Equals(email.GetString(), username, StringComparison.OrdinalIgnoreCase);
        }

        private async Task<bool> IsApplicationEditableAsync(string applicationNo)
        {
            if (string.IsNullOrWhiteSpace(applicationNo))
                return false;

            try
            {
                var isSubmitted = await _webportals.IsApplicationSubmittedAsync(applicationNo);
                return !isSubmitted.return_value;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, 
                    "Error checking application submission status for {ApplicationNo}", 
                    applicationNo);
                return false;
            }
        }
    }
}
