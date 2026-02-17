using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NAVWS;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Recruitment.Library.DTOs;
using Recruitment.Library.Interfaces;

namespace Recruitment.Server.Controllers
{
    [ApiController]
    [Route("/api/auth")]
    public class AuthController(IWebService webService, IAuthService authService, IHelperService helperService) : Controller
    {
        private readonly Recruitment_PortClient webportals = webService.ObjNav();
        private readonly IAuthService _authService = authService;
        private readonly IHelperService _helperService = helperService;

        [HttpGet("getusers")]
        public async Task<IActionResult> Index()
        {
            try
            {
                // 1. Asynchronously call the web portal service to retrieve all user records.
                var response = await webportals.GetAllUsersAsync();

                // 2. Extract the raw result string (expected to be JSON format) from the service response.
                var result = response.return_value;

                // 3. Convert the JSON string into a strongly-typed list of User Data Transfer Objects (DTOs).
                var data = JsonConvert.DeserializeObject<List<UsersDto>>(result) ?? [];

                // 4. Return an HTTP 200 OK status containing the list of users.
                return Ok(data);
            }
            catch (Exception ex)
            {
                // 5. If any error occurs (network failure, database error, or invalid JSON), 
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("createaccount")]
        public async Task<IActionResult> CreateAccount(CreateAccountDto account)
        {
            try
            {
                // 1. Extract and normalize user data from the incoming request model
                string firstName = account.firstName;
                // Use the null-coalescing operator (??) to ensure middleName is never null
                string middleName = account.middleName ?? string.Empty;
                string lastName = account.lastName;
                string idNumber = account.idNumber;
                int telNo = account.telNo;
                string emailAddress = account.emailAddress;
                string requestLink = account.requestLink; // The frontend base URL (e.g., https://portal.kuccps.net)

                // 2. Persist the new user record in the backend/external system asynchronously
                await webportals.CreateOnlineUserAsync(emailAddress, firstName, middleName, lastName, idNumber, telNo);

                // 3. Generate a secure Access Token for account activation
                var login = new LoginDto { username = emailAddress };
                string accessToken = _authService.GenerateAccessToken(login);

                // 4. Construct the activation deep-link
                // This link points to the frontend "Activate" route with the email and token as query parameters
                string activationLink = $"{requestLink}/account/activate-account?emailAddress={emailAddress}&token={accessToken}";

                // 5. Define the Email Subject and HTML Body
                string subject = "KUCCPS Account Activation - Action Required";

                // Using an interpolated verbatim string ($@) to create a clean, multi-line HTML template
                string body = $@"
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                            .header {{ background-color: #0066cc; color: white; padding: 20px; text-align: center; }}
                            .content {{ background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }}
                            .button {{ display: inline-block; padding: 12px 30px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                            .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <h2>KUCCPS Account Activation</h2>
                            </div>
                            <div class='content'>
                                <p>Dear {firstName} {middleName} {lastName},</p>
    
                                <p>Thank you for registering with the Kenya Universities and Colleges Central Placement Service (KUCCPS).</p>
    
                                <p>Your account has been successfully created. To complete the registration process, please activate your account by clicking the button below:</p>
    
                                <p style='text-align: center;'>
                                    <a style='color: white;' href='{activationLink}' class='button' target='_blank'>Activate My Account</a>
                                </p>
    
                                <p>Alternatively, you can copy and paste the following link into your browser:</p>
                                <p style='word-break: break-all; color: #0066cc;'>{activationLink}</p>
    
                                <p><strong>Important:</strong> This activation link will expire in 2 hours for security purposes.</p>
    
                                <p>If you did not create this account, please disregard this email or contact our support team immediately.</p>
    
                                <p>Best regards,<br/>
                                KUCCPS Support Team</p>
                            </div>  
                            <div class='footer'>
                                <p>This is an automated email. Please do not reply to this message.</p>
                                <p>&copy; {DateTime.Now.Year} Kenya Universities and Colleges Central Placement Service. All rights reserved.</p>
                                <p>For assistance, contact: support@kuccps.ac.ke</p>
                            </div>
                        </div>
                    </body>
                    </html>
                ";

                // 6. Dispatch the activation email asynchronously via the portal's notification service
                await webportals.SendEmailNotificationAsync(emailAddress, subject, body);

                // 7. Return success response to the frontend
                return Ok(new
                {
                    success = true,
                    message = "Account has been created successfully. Please follow the link sent to your email address to activate your account!"
                });
            }
            catch (Exception ex)
            {
                // 8. Global error handling: catch failures in User Creation, Token Generation, or Emailing
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("activateaccount")]
        public async Task<IActionResult> ActivateUserAccount(string token)
        {
            try
            {
                // 1. Validate the provided token (likely a JWT) sent via the activation link.
                var tokenData = _helperService.ValidateTokenData(token);

                // 2. Extract the username from the validated token payload.
                string username = tokenData?.Username!;

                // 3. Asynchronously call the web portal service to update the user's status.
                await webportals.ActivateAccountAsync(username);

                // 4. Return an HTTP 200 OK response with a success flag and message for the frontend.
                return Ok(new { success = true, message = "Account has been activated successfully!" });
            }
            catch (Exception ex)
            {
                // 5. Catch any errors that occur during validation (e.g., Expired Token) 
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("updatepassword")]
        public async Task<IActionResult> UpdatePassword(UpdatePasswordDto update)
        {
            try
            {
                // 1. Extract the unique identifier (email address) from the update model
                string username = update.emailAddress;

                // 2. Hash the plain-text password using BCrypt.
                string password = BCrypt.Net.BCrypt.HashPassword(update.password);

                // 3. Asynchronously call the portal service to save the new hashed password.
                await webportals.UpdateUserPasswordAsync(username, password);

                // 4. Return an HTTP 200 OK response indicating success.
                return Ok(new
                {
                    success = true,
                    message = "Password has been updated successfully. Please proceed to login."
                });
            }
            catch (Exception ex)
            {
                // 5. Catch failures such as database connectivity issues or service timeouts.
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("sentpasswordresetlink")]
        public async Task<IActionResult> PasswordResetLink(string emailAddress, string requestLink)
        {
            try
            {
                // 1. Validate the provided email address.
                await webportals.CheckValidEmailAddressAsync(emailAddress);

                // 2. Construct the password reset deep-link.
                string activationLink = $"{requestLink}/account/activate-account?emailAddress={emailAddress}";

                // 3. Define the Email Subject
                string subject = "KUCCPS Password Reset Link";

                // 4. Create the HTML Email Body using an interpolated verbatim string ($@"")
                string body = $@"
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                            .header {{ background-color: #0066cc; color: white; padding: 20px; text-align: center; }}
                            .content {{ background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }}
                            .button {{ display: inline-block; padding: 12px 30px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                            .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <h2>KUCCPS Password Reset Link</h2>
                            </div>
                            <div class='content'>
                                <p>Dear User,</p>
     
                                <p>Thank you for registering with the Kenya Universities and Colleges Central Placement Service (KUCCPS).</p>
     
                                <p>Please reset your password by clicking the button below:</p>
     
                                <p style='text-align: center;'>
                                    <a style='color: white;' href='{activationLink}' class='button' target='_blank'>Reset Password</a>
                                </p>
     
                                <p>Alternatively, you can copy and paste the following link into your browser:</p>
                                <p style='word-break: break-all; color: #0066cc;'>{activationLink}</p>
     
                                <p><strong>Important:</strong> This activation link will expire in 2 hours for security purposes.</p>
     
                                <p>If you did not create this account, please disregard this email or contact our support team immediately.</p>
     
                                <p>Best regards,<br/>
                                KUCCPS Support Team</p>
                            </div>
                            <div class='footer'>
                                <p>This is an automated email. Please do not reply to this message.</p>
                                <p>&copy; {DateTime.Now.Year} Kenya Universities and Colleges Central Placement Service. All rights reserved.</p>
                                <p>For assistance, contact: support@kuccps.ac.ke</p>
                            </div>
                        </div>
                    </body>
                    </html>
                ";

                // 5. Asynchronously dispatch the email via the portal's notification service.
                await webportals.SendEmailNotificationAsync(emailAddress, subject, body);

                // 6. Return an HTTP 200 OK status to the client confirming the email was sent.
                return Ok(new
                {
                    success = true,
                    message = $"Password reset link has been sent to your email address {emailAddress}"
                });
            }
            catch (Exception ex)
            {
                // 7. Handle failures such as "Email Not Found", "Service Unavailable", or "Mail Server Error".
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto login)
        {
            try
            {
                // 1. Extract credentials from the login request model
                string username = login.username;
                string password = login.password;

                // 2. Validate that the email address exists in the system
                await webportals.CheckValidEmailAddressAsync(username);

                // 3. Check if the user has completed the email activation process
                var accountActivated = await webportals.HasActivatedAccountAsync(username);
                var accountActivatedRes = accountActivated.return_value;

                // If the account is not activated, stop the login and inform the user
                if (!accountActivatedRes)
                    throw new Exception("Your account has not been activated. Please follow the link sent to your email address to activate!");

                // 4. Retrieve the stored hashed password from the database/portal
                var userPassword = await webportals.GetUserPasswordAsync(username);
                var hashedPassword = userPassword.return_value.ToString();

                // 5. Securely compare the provided plain-text password with the stored hash using BCrypt
                if (!BCrypt.Net.BCrypt.Verify(password, hashedPassword))
                    throw new Exception("Incorrect password. Please try again!");

                // 6. Execute the core login logic in the portal system and retrieve the user's unique identity
                var userResponse = await webportals.UserLoginAsync(username);
                var userResult = userResponse.return_value;

                // 7. Prepare the login data for token generation
                var model = new LoginDto
                {
                    username = userResult,
                    password = BCrypt.Net.BCrypt.HashPassword(password)
                };

                // 8. Generate a secure JWT (Access Token) using the internal Authentication Service
                var accessToken = _authService.GenerateAccessToken(model);

                // 9. Return an HTTP 200 OK with the generated token
                return Ok(new { success = true, accessToken });
            }
            catch (Exception ex)
            {
                // 10. Centralized Error Handling: 
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("deleteaccount")]
        public async Task<IActionResult> DeleteAccount(string username)
        {
            try
            {
                // 1. Asynchronously call the portal service to remove the user account.
                await webportals.DeleteAccountAsync(username);

                // 2. Return an HTTP 200 OK status to indicate the operation was successful.
                return Ok(new { success = true, message = "Account deleted successfully!" });
            }
            catch (Exception ex)
            {
                // 3. Catch any errors that occur during the deletion process.
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("getuserdetails")]
        public async Task<IActionResult> GetUserDetails(string token)
        {
            try
            {
                // 1. Validate the provided access token (JWT).
                var tokenData = _authService.ValidateAccessToken(token);

                // 2. Extract the username from the validated token payload.
                string username = tokenData?.Username!;

                // 3. Asynchronously fetch the raw user data from the external portal service.
                var response = await webportals.GetUserDetailsAsync(username);

                // 4. Extract the actual data content (usually a JSON string) from the service response.
                var result = response.return_value;

                // 5. Convert the JSON string into a strongly-typed User Data Transfer Object (UserDto).
                var user = JsonConvert.DeserializeObject<UserDto>(result);

                // 6. Return an HTTP 200 OK status containing the populated user object.
                return Ok(user);
            }
            catch (Exception ex)
            {
                // 7. Global Error Handling:
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("hasupdatedprofile")]
        public async Task<IActionResult> HasUpdatedProfile(string token)
        {
            try
            {
                // 1. Validate the provided JWT access token.
                var tokenData = _authService.ValidateAccessToken(token);

                // 2. Extract the username from the validated token payload.
                string username = tokenData?.Username!;

                // 3. Asynchronously call the web portal service to check the user's profile status.
                var response = await webportals.HasUpdatedProfileAsync(username);

                // 4. Extract the boolean result (true/false) from the service's return wrapper.
                var result = response.return_value;

                // 5. Return an HTTP 200 OK status with the profile update status.
                return Ok(new { success = true, updated = result });
            }
            catch (Exception ex)
            {
                // 6. Global error handling:
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("updateuserprofile")]
        public async Task<IActionResult> UpdateUserProfile(UpdateProfileDto update)
        {
            try
            {
                // 1. Security/Authentication: Extract the token and validate it.
                string token = update.token;
                var tokenData = _authService.ValidateAccessToken(token);

                // 2. Personal Identity Mapping:
                int initials = update.initials;
                string firstName = update.firstName;
                // Use null-coalescing to ensure MiddleName is never null to prevent service errors.
                string middleName = update.middleName ?? string.Empty;
                string lastName = update.lastName;
                string gender = update.gender;
                string maritalStatus = update.maritalStatus;
                DateTime dateOfBirth = update.dateOfBirth;

                // 3. Secure Identity Extraction:
                // IMPORTANT: The emailAddress is pulled from the VALIDATED token (claims), 
                // NOT the request body. This prevents users from updating someone else's profile.
                string emailAddress = tokenData?.Username!;

                // 4. Contact & Address Details
                string idNumber = update.idNumber;
                int telNo = update.telNo;
                int altTelNo = update.altTelNo;
                string postCode = update.postCode;
                string postalAddress = update.postalAddress;
                string country = update.country;
                string county = update.county;
                string subCounty = update.subCounty;

                // 5. Statutory & Ethnicity Details
                string ethnicity = update.ethnicity;
                string kraPin = update.kraPin;

                // 6. Disability (P.W.D) Information:
                bool isPwd = update.isPwd;
                string pwdNo = update.pwdNo ?? string.Empty;
                string disabilityType = update.disabilityType ?? string.Empty;

                // 7. External Service Integration:
                // Asynchronously call the portal service to persist the changes in the main database.
                await webportals.UpdateUserProfileAsync(emailAddress, gender, maritalStatus, dateOfBirth, altTelNo, postCode, postalAddress, country, county, subCounty, ethnicity, kraPin, isPwd, pwdNo, disabilityType);

                // 8. Return Success Result
                return Ok(new { success = true, message = "Profile has been updated successfully!" });
            }
            catch (Exception ex)
            {
                // 9. Error Handling:
                // Catch validation failures (expired token), network issues, or database errors.
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
