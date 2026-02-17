using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NAVWS;
using Newtonsoft.Json;
using Recruitment.Library.DTOs;
using Recruitment.Library.Interfaces;

namespace Recruitment.Server.Controllers
{
    [ApiController]
    [Route("/api/job")]
    public class JobController(IWebService webService, IAuthService authService) : Controller
    {
        private readonly Recruitment_PortClient webportals = webService.ObjNav();
        private readonly IAuthService _authService = authService;
        [HttpGet("getadvertisedjobs")]
        public async Task<IActionResult> GetAdvertisedJobs()
        {
            try
            {
                // 1. Call the external service asynchronously to fetch job advertisements.
                // The 'await' keyword ensures the thread is not blocked during the network request.
                var response = await webportals.GetAdvertisedJobsAsync();

                // 2. Extract the raw string data (typically a JSON string) from the response object.
                var result = response.return_value;

                // 3. Deserialize the JSON string into a strongly-typed list of Data Transfer Objects (DTOs).
                // The '?? []' (Collection Expression) ensures that if 'result' is null or empty, 
                // an empty list is returned instead of a null value to prevent client-side errors.
                var positions = JsonConvert.DeserializeObject<List<AdvertisedJobsDto>>(result) ?? [];

                // 4. Return an HTTP 200 (OK) status code containing the list of jobs.
                return Ok(positions);
            }
            catch (Exception ex)
            {
                // 5. If any error occurs (Network failure, Deserialization error, etc.), 
                // return an HTTP 400 (BadRequest) with a JSON object containing the error message.
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("jobdetails")]
        public async Task<IActionResult> GetJobDetails(string jobId)
        {
            try
            {
                // 1. Fetch the Job Purpose (General overview text)
                var purposeResponse = await webportals.GetJobPurposeAsync(jobId);
                string jobSummary = purposeResponse.return_value;

                // 2. Fetch and parse Job Requirements (Skills/Qualifications)
                var requirementsResponse = await webportals.GetJobRequirementsAsync(jobId);
                string requirementsJson = requirementsResponse.return_value;
                var requirementItems = JsonConvert.DeserializeObject<List<ConfigDto>>(requirementsJson) ?? [];

                // 3. Fetch and parse Job Responsibilities (Duties/Tasks)
                var responsibilitiesResponse = await webportals.GetJobResponsibilitiesAsync(jobId);
                string responsibilitiesJson = responsibilitiesResponse.return_value;
                var responsibilityItems = JsonConvert.DeserializeObject<List<ConfigDto>>(responsibilitiesJson) ?? [];

                // 4. Fetch the job title
                var jobResponse = await webportals.GetJobTitleAsync(jobId);
                var jobTitle = jobResponse.return_value;

                // 4. Aggregate all job-related data into a single anonymous response object
                var jobDetails = new
                {
                    JobTitle = jobTitle,
                    Purpose = jobSummary,
                    Requirements = requirementItems,
                    Responsibilities = responsibilityItems
                };

                // 5. Return the consolidated data with an HTTP 200 status
                return Ok(jobDetails);
            }
            catch (Exception ex)
            {
                // 6. Handle any service or parsing errors by returning a 400 Bad Request
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("getapplications")]
        public async Task<IActionResult> GetMyApplications(string token)
        {
            try
            {
                // 1. Validate the provided access token using the authentication service
                // This extracts the claims and ensures the token is not expired or tampered with
                var tokenData = _authService.ValidateAccessToken(token);

                // 2. Extract the username from the validated token data
                // The '!' (null-forgiving operator) suggests we expect Username to be non-null if the token is valid
                string username = tokenData?.Username!;

                // 3. Asynchronously call the web portal service to fetch applications associated with the username
                var response = await webportals.GetApplicationsAsync(username);

                // 4. Extract the raw string result (expected to be a JSON string) from the service response
                var result = response.return_value;

                // 5. Deserialize the JSON string into a list of Application Data Transfer Objects (DTOs)
                // If the result is null or empty, initialize 'data' as an empty list to prevent null reference errors
                var data = JsonConvert.DeserializeObject<List<ApplicationsDto>>(result) ?? [];

                // 6. Return a successful HTTP 200 OK response containing the list of applications
                return Ok(data);
            }
            catch (Exception ex)
            {
                // 7. If any error occurs (Invalid token, service failure, or JSON error), 
                // catch the exception and return an HTTP 400 BadRequest with the error details
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("submitjobapplication")]
        public async Task<IActionResult> SubmitJobApplication(JobDto job)
        {
            try
            {
                // 1. Authentication & Security:
                string token = job.token;
                var tokenData = _authService.ValidateAccessToken(token);

                // 2. Identity Verification:
                // Extract the username directly from the validated token claims.
                string username = tokenData?.Username!;

                // 3. Job Context Extraction:
                // Retrieve the specific job identifier and the recruitment reference number.
                string jobId = job.jobId;
                string referenceNo = job.referenceNo;

                // 4. External Service Integration:
                // Asynchronously trigger the application submission in the portal backend.
                var response = await webportals.SubmitJobApplicationAsync(username, referenceNo, jobId);

                // 5. Response Handling:
                // Extract the generated Document Number (Application ID) returned by the service.
                var result = response.return_value;

                // 6. Return Success Result:
                // Send back an HTTP 200 OK with the document number so the user can track their application.
                return Ok(new { success = true, documentNo = result });
            }
            catch (Exception ex)
            {
                // 7. Centralized Error Handling:
                // Catches validation failures, service timeouts, or database constraint errors.
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("getminimumrequirements")]
        public async Task<IActionResult> GetMinimumRequirements(string documentNo)
        {
            try
            {
                // 1. Asynchronously call the web portal service to fetch requirements 
                var response = await webportals.GetMinimumRequirementsAsync(documentNo);

                // 2. Extract the raw payload (usually a JSON string) from the service response object.
                var result = response.return_value;

                // 3. Deserialize the JSON string into a strongly-typed list of RequirementsDto objects.
                var requirements = JsonConvert.DeserializeObject<List<RequirementsDto>>(result) ?? [];

                // 4. Return an HTTP 200 OK status containing the list of requirements for the frontend.
                return Ok(requirements);
            }
            catch (Exception ex)
            {
                // 5. Global Exception Handling:
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("updateminimumrequirements")]
        public async Task<IActionResult> UpdateMinimumRequirements(List<RequirementsDto> requirements, string token)
        {
            try
            {
                // 1. Security: Validate the provided access token.
                var tokenData = _authService.ValidateAccessToken(token);

                // 2. Data Persistence: Iterate through the list of requirements sent from the frontend.
                foreach (var requirement in requirements)
                {
                    // Extract individual properties for clarity before passing to the service.
                    string code = requirement.code;
                    int has = requirement.has;
                    string documentNo = requirement.documentNo;

                    // 3. Service Call: Asynchronously update each requirement in the Business Central backend via the web portal service.
                    await webportals.UpdateMinimumRequirementAsync(documentNo, code, has);
                }

                // 4. Response: Return an HTTP 200 OK status with a success flag and a professional confirmation message.
                return Ok(new { success = true, message = "Minimum requirements have been updated successfully!" });
            }
            catch (Exception ex)
            {
                // 5. Error Handling: Catch any validation or communication exceptions.
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("getacademicqualifications")]
        public async Task<IActionResult> GetAcademicQualifications(string documentNo)
        {
            try
            {
                // 1. Asynchronously call the web portal service to fetch academic qualifications 
                var response = await webportals.GetAcademicQualificationsAsync(documentNo);

                // 2. Extract the raw string result (typically a JSON string returned from Business Central) 
                var result = response.return_value;

                // 3. Deserialize the JSON string into a strongly-typed list of Qualification Data Transfer Objects (DTOs).
                var qualifications = JsonConvert.DeserializeObject<List<QualificationDto>>(result) ?? [];

                // 4. Return an HTTP 200 OK status containing the list of qualifications.
                return Ok(qualifications);
            }
            catch (Exception ex)
            {
                // 5. If any error occurs (e.g., network failure, invalid documentNo, or JSON parsing error),
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("submitacademicqualifications")]
        public async Task<IActionResult> SubmitAcademicQualifications(AcademicQualificationsDto qualifications)
        {
            try
            {
                // 1. Validate the provided access token using the Authentication Service.
                var tokenData = _authService.ValidateAccessToken(qualifications.token);

                // 2. Map the properties from the 'qualifications' input object to local variables.
                string documentNo = qualifications.documentNo;
                string areaOfStudy = qualifications.areaOfStudy;
                string code = qualifications.code;
                string description = qualifications.description;
                string institution = qualifications.institution;
                DateTime startDate = qualifications.startDate;
                DateTime endDate = qualifications.endDate;
                string grade = qualifications.grade;

                // 3. Call the asynchronous service method to save the academic qualification record to the database.
                await webportals.InsertAcademicQualificationAsync(documentNo, areaOfStudy, code, description, institution, startDate, endDate, grade);

                // 4. Return an HTTP 200 OK response with a success flag and a user-friendly message.
                return Ok(new { success = true, message = "Academic qualification has been inserted successfully!" });
            }
            catch (Exception ex)
            {
                // 5. If any error occurs (e.g., database connection failure, invalid token, or data validation error),
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [Authorize]
        [HttpDelete("removeacademicqualfiication")]
        public async Task<IActionResult> RemoveAcademicQualification(string id)
        {
            try
            {
                // Attempt to asynchronously remove the academic qualification record from the system using its unique ID
                await webportals.RemoveAcademicQualificationAsync(id);

                // Return an HTTP 200 OK response indicating the deletion was successful
                return Ok(new { success = true, message = "Academic qualification has been removed successfully!" });
            }
            catch (Exception ex)
            {
                // If an error occurs (e.g., record not found, database connection issue), 
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("getworkexperience")]
        public async Task<IActionResult> GetWorkExperience(string documentNo)
        {
            try
            {
                // 1. Asynchronously fetch the raw work experience data from the web portal service 
                var response = await webportals.GetWorkExperienceAsync(documentNo);

                // 2. Extract the payload (typically a JSON string) from the service response object.
                var result = response.return_value;

                // 3. Convert the JSON string into a strongly-typed list of 'WorkExperienceDto' objects.
                var workExperiences = JsonConvert.DeserializeObject<List<WorkExperienceDto>>(result) ?? [];

                // 4. Return an HTTP 200 OK response containing the list of work experiences.
                return Ok(workExperiences);
            }
            catch (Exception ex)
            {
                // 5. If an error occurs (e.g., service timeout, invalid JSON, or database error),
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("submitworkexperience")]
        public async Task<IActionResult> SubmitWorkExperience(WorkExperienceDto workExperience)
        {
            try
            {
                // 1. Validate the access token to ensure the request is authorized
                var tokenData = _authService.ValidateAccessToken(workExperience.token);

                // 2. Extract work experience details from the incoming data object
                string documentNo = workExperience.documentNo;
                string position = workExperience.position;
                string institution = workExperience.institution;
                DateTime startDate = workExperience.startDate;
                DateTime endDate = workExperience.endDate;

                // 3. Asynchronously call the service to insert the new work experience record
                await webportals.InsertWorkExperienceAsync(documentNo, position, institution, startDate, endDate);

                // 4. Return a success response 
                return Ok(new { success = true, message = "Work experience has been inserted successfully!" });
            }
            catch (Exception ex)
            {
                // 5. Handle any errors (auth failure, DB issues, etc.) and return a 400 Bad Request
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [Authorize]
        [HttpDelete("removeworkexperience")]
        public async Task<IActionResult> RemoveWorkExperience(string id)
        {
            try
            {
                // 1. Asynchronously call the service method to remove the work experience record from the database using its unique identifier (id).
                await webportals.RemoveWorkExperienceAsync(id);

                // 2. If the operation is successful, return an HTTP 200 OK response with a success flag and a confirmation message.
                return Ok(new { success = true, message = "Work experience has been removed successfully!" });
            }
            catch (Exception ex)
            {
                // 3. If an error occurs (e.g., record not found, database connection issues), catch the exception and return an HTTP 400 Bad Request with the error message.
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("getrelationships")]
        public async Task<IActionResult> GetRelationships(string documentNo)
        {
            try
            {
                // 1. Asynchronously retrieve relationship data from the web portal service 
                // for the specified document number.
                var response = await webportals.GetRelationshipsAsync(documentNo);

                // 2. Extract the raw result payload (usually a JSON string) from the service response.
                var result = response.return_value;

                // 3. Deserialize the JSON string into a strongly-typed list of Relationship Data Transfer Objects (DTOs).
                // The '?? []' ensures that if the result is null or empty, an empty list is initialized.
                var data = JsonConvert.DeserializeObject<List<RelationshipDto>>(result) ?? [];

                // 4. Return an HTTP 200 OK status containing the list of relationships.
                return Ok(data);
            }
            catch (Exception ex)
            {
                // 5. If an exception occurs (e.g., service failure or deserialization error),
                // return an HTTP 400 Bad Request with the error details.
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("submitrelationship")]
        public async Task<IActionResult> SubmitRelationship(RelationshipDto relationship)
        {
            try
            {
                // 1. Validate the provided access token to ensure the request is authorized.
                var tokenData = _authService.ValidateAccessToken(relationship.token);

                // 2. Map properties from the 'relationship' DTO to local variables.
                // This organizes the data (Names, Contact Info, Type, etc.) for the service call.
                string documentNo = relationship.documentNo;
                string type = relationship.type;
                string firstName = relationship.firstName;
                string lastName = relationship.lastName;
                string middleName = relationship.middleName;
                int phoneNo = relationship.phoneNo;
                string email = relationship.email;
                string relationships = relationship.relationship;
                string institution = relationship.institution;
                DateTime birthDate = relationship.birthDate;

                // 3. Asynchronously call the service to insert the relationship record into the system.
                await webportals.InsertRelationshipsAsync(type, documentNo, firstName, middleName, lastName, phoneNo, email, relationships, institution, birthDate);

                // 4. Return an HTTP 200 OK response indicating the record was successfully created.
                return Ok(new { success = true, message = "Relationship has been added successfully!" });
            }
            catch (Exception ex)
            {
                // 5. Catch any exceptions (e.g., validation failure, database connection error) 
                // and return an HTTP 400 Bad Request with the error message.
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [Authorize]
        [HttpDelete("removerelationship")]
        public async Task<IActionResult> RemoveRelationship(string id)
        {
            try
            {
                // 1. Asynchronously call the service method to delete the relationship record from the database using the provided unique identifier (id).
                await webportals.RemoveRelationshipAsync(id);

                // 2. If the deletion is successful, return an HTTP 200 OK response with a success flag and a confirmation message for the user.
                return Ok(new { success = true, message = "Relationship has been removed successfully!" });
            }
            catch (Exception ex)
            {
                // 3. If an error occurs (e.g., the ID doesn't exist, database connection issues, or unauthorized access), catch the exception and return an HTTP 400 Bad Request 
                // containing the specific error message.
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("getattachments")]
        public async Task<IActionResult> GetAttachments(string documentNo)
        {
            try
            {
                // 1. Asynchronously retrieve the raw list of attached documents for a specific record/application
                var response = await webportals.GetAttachedDocumentsAsync(documentNo);

                // 2. Extract the payload (usually a JSON-formatted string) from the service response
                var result = response.return_value;

                // 3. Deserialize the JSON string into a strongly-typed list of 'DocumentsDto' objects.
                // If the result is null or empty, the null-coalescing operator (??) ensures an empty list [] is returned.
                var data = JsonConvert.DeserializeObject<List<DocumentsDto>>(result) ?? [];

                // 4. Return an HTTP 200 OK status with the retrieved document data
                return Ok(data);
            }
            catch (Exception ex)
            {
                // 5. Catch any technical or business logic errors and return an HTTP 400 Bad Request explaining why the operation failed.
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("uploadattachment")]
        public async Task<IActionResult> UploadAttachment(FileDto file)
        {
            try
            {
                // 1. Validate the access token provided in the file object to ensure the user is authorized.
                var tokenData = _authService.ValidateAccessToken(file.token);

                // 2. Map the properties from the 'file' DTO to local variables.
                string documentNo = file.documentNo;
                string fileName = file.fileName;
                string fileExtenstion = file.fileExtension;
                string base64string = file.base64String;

                // 3. Asynchronously upload the document to the portal.
                // Concatenates fileName and fileExtension to form the full filename.
                // The integer '52178435' likely represents a specific document category or system ID.
                await webportals.UploadDocumentAsync(documentNo, $"{fileName}.{fileExtenstion}", base64string, 52178435);

                // 4. Return an HTTP 200 OK response with a success flag and confirmation message.
                return Ok(new { success = true, message = "Document has been uploaded successfully!" });
            }
            catch (Exception ex)
            {
                // 5. Catch any errors (e.g., unauthorized token, file size limits, or service issues) and return an HTTP 400 Bad Request with the error details.
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [Authorize]
        [HttpDelete("removeattachment")]
        public async Task<IActionResult> RemoveAttachment(string id)
        {
            try
            {
                // 1. Asynchronously call the service to delete the document from the system using its unique identifier (id).
                await webportals.RemoveDocumentAsync(id);

                // 2. If the operation succeeds, return an HTTP 200 OK response with a success flag and a confirmation message.
                return Ok(new { success = true, message = "Document has been removed successfully!" });
            }
            catch (Exception ex)
            {
                // 3. If an error occurs (e.g., document not found, database error, or connectivity issues), catch the exception and return an HTTP 400 Bad Request with the error details.
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("getfullapplicationpreview")]
        public async Task<IActionResult> GetFullApplicationPreview(string documentNo)
        {
            try
            {
                // 1. Fetch and deserialize Academic Qualifications
                var response = await webportals.GetAcademicQualificationsAsync(documentNo);
                var result = response.return_value;
                var qualifications = JsonConvert.DeserializeObject<List<QualificationDto>>(result) ?? [];

                // 2. Fetch and deserialize Work Experience history
                var responseExperience = await webportals.GetWorkExperienceAsync(documentNo);
                var resultExperience = responseExperience.return_value;
                var experience = JsonConvert.DeserializeObject<List<WorkExperienceDto>>(resultExperience) ?? [];

                // 3. Fetch and deserialize all Attached Documents (certificates, IDs, etc.)
                var responseAttachments = await webportals.GetAttachedDocumentsAsync(documentNo);
                var resultAttachments = responseAttachments.return_value;
                var attachments = JsonConvert.DeserializeObject<List<DocumentsDto>>(resultAttachments) ?? [];

                // 4. Fetch and deserialize Personal Relationships (Next of Kin and Referees)
                var responseRelationship = await webportals.GetRelationshipsAsync(documentNo);
                var resultRelationship = responseRelationship.return_value;
                var relationships = JsonConvert.DeserializeObject<List<RelationshipDto>>(resultRelationship) ?? [];

                // 5. Consolidate all data into a single preview object.
                // Use LINQ to split the relationships list into two distinct categories: 'Next of Kin' and 'Referees'.
                var newObj = new
                {
                    qualifications,
                    experience,
                    attachments,
                    kin = relationships.Where(r => r.type == "Next of Kin"),
                    referees = relationships.Where(r => r.type == "Referees")
                };

                // 6. Return the consolidated application data
                return Ok(newObj);
            }
            catch (Exception ex)
            {
                // Return an error response if any service call or deserialization fails
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("finalsubmitapplication")]
        public async Task<IActionResult> FinalSubmitApplication(string documentNo, string token, string requestLink)
        {
            try
            {
                // 1. Validate the user's access token and extract the username (identity)
                var tokenData = _authService.ValidateAccessToken(token);
                string username = tokenData.Username!;

                // 2. Fetch the applicant's full name from the service for email personalization
                var applicantNameResponse = await webportals.GetApplicantNameAsync(username);
                var applicantName = applicantNameResponse.return_value;

                // 3. Define the email metadata (Subject and dynamic HTML body)
                string subject = $"Application Received: {documentNo}";

                // Professional HTML template with inline styling for email client compatibility
                string body = $@"
                <html>
                <head>
                    <style>
                        .container {{ font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .header {{ background-color: #00171f; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                        .content {{ padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }}
                        .button {{ background-color: #dc2626; color: #ffffff !important; padding: 14px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin: 20px 0; }}
                        .footer {{ text-align: center; font-size: 12px; color: #9ca3af; margin-top: 20px; }}
                        .highlight {{ color: #dc2626; font-weight: bold; }}
                    </style>
                </head>
                <body style='margin: 0; padding: 20px; background-color: #f9fafb;'>
                    <div class='container' style='max-width: 600px; margin: 0 auto; background-color: #ffffff;'>
        
                        <!-- Header: Branding -->
                        <div class='header'>
                            <h1 style='color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;'>CAREER PORTAL</h1>
                        </div>

                        <!-- Body: Personalized Content -->
                        <div class='content'>
                            <h2 style='color: #00171f; margin-top: 0;'>Application Confirmation</h2>
                            <p>Dear <strong>{applicantName}</strong>,</p>

                            <p>Thank you for your interest in a career with us. We are pleased to confirm that we have successfully received your application for position reference: <span class='highlight'>{documentNo}</span>.</p>

                            <p>Our recruitment team is currently reviewing all submissions. Should your profile be shortlisted for the next stage, a member of our team will contact you directly via the details provided in your profile.</p>

                            <!-- Call to Action: Status Tracking Link -->
                            <div style='text-align: center;'>
                                <a href='{requestLink}' class='button'>Track Application Status</a>
                            </div>

                            <p style='font-size: 14px; color: #6b7280;'>Note: You can update your professional profile or documents at any time before the job advertisement deadline.</p>

                            <hr style='border: 0; border-top: 1px solid #f3f4f6; margin: 30px 0;'>

                            <p style='margin: 0;'>Best regards,</p>
                            <p style='margin: 0; font-weight: bold; color: #00171f;'>The Recruitment Team</p>
                        </div>

                        <!-- Footer: Legal/Auto-generated disclaimer -->
                        <div class='footer'>
                            <p>This is an automated notification. Please do not reply to this email.</p>
                            <p>&copy; {DateTime.Now.Year} Official Career Portal. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>";

                // 4. Asynchronously send the email notification to the user
                await webportals.SendEmailNotificationAsync(username, subject, body);

                // 5. Finalize the application submission state in the database
                await webportals.SubmitApplicationAsync(documentNo);

                // 6. Return success response to the frontend
                return Ok(new { success = true, message = "Application has been submitted successfully!" });
            }
            catch (Exception ex)
            {
                // 7. Gracefully catch any errors (Auth, Mail Server, or Database) and return failure details
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("acceptrecommendation")]
        public async Task<IActionResult> AcceptRecommendation(string documentNo)
        {
            try
            {
                // 1. Asynchronously call the service to process the acceptance of a recommendation for the specified document number.
                await webportals.AcceptRecomendationAsync(documentNo);

                // 2. Return an HTTP 200 OK response with a success flag and confirmation message once the status has been updated in the system.
                return Ok(new { success = true, message = "Recommendation has been accepted successfully!" });
            }
            catch (Exception ex)
            {
                // 3. Catch any errors (e.g., document not found, database connection issues) and return an HTTP 400 Bad Request with the error details.
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("rejectrecommendation")]
        public async Task<IActionResult> RejectRecommendation(string documentNo)
        {
            try
            {
                // 1. Asynchronously call the service method to update the state of the recommendation to 'Rejected' for the specified document number.
                await webportals.RejectRecomendationAsync(documentNo);

                // 2. Return an HTTP 200 OK response with a success flag and a confirmation message.
                return Ok(new { success = true, message = "Recommendation has been rejected successfully!" });
            }
            catch (Exception ex)
            {
                // 3. If an error occurs (e.g., document reference not found or database failure), catch the exception and return an HTTP 400 Bad Request with the error message.
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("generateofferletter")]
        public async Task<IActionResult> GenerateOfferLetter(string documentNo)
        {
            try
            {
                // 1. Construct a sanitized filename for the PDF.
                string fileName = $"Offer_Letter-{documentNo.Replace("/", "")}.pdf";

                // 2. Asynchronously call the service to generate the offer letter PDF.
                var result = await webportals.GenerateOfferLetterAsync(documentNo, fileName);

                // 3. Extract the base64-encoded string representing the PDF content from the service response.
                var base64String = result.return_value;

                // 4. Return a successful response containing the file metadata and the encoded data.
                // This allows the frontend to trigger a file download for the user.
                return Ok(new
                {
                    success = true,
                    fileName,
                    fileType = "application/pdf",
                    base64Data = base64String
                });
            }
            catch (Exception ex)
            {
                // 5. Catch any errors (e.g., document not found, service unavailable) and return an HTTP 400 Bad Request with the error message.
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
