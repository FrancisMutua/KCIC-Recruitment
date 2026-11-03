using Microsoft.AspNetCore.Mvc;
using NAVWS;
using System.Text.Json;
using Recruitment.Server.DTOs;
using Recruitment.Server.Interfaces;
using Recruitment.Server.Models;
using Recruitment.Server.Utilities;

namespace Recruitment.Server.Controllers
{
    [ApiController]
    [Route("/api/auth")]
    public class AuthController(IAuthService authService, IWebService webService, IEmailService emailService, ILogger<AuthController> logger) : Controller
    {
        private readonly IAuthService _authService = authService;
        private readonly IEmailService _emailService = emailService;
        private readonly ILogger<AuthController> _logger = logger;
        private readonly Recruitment_PortClient _webportals = webService.ObjNav();
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto login)
        {
            try
            {
                string username = login.username;
                string password = login.password;

                var hashedPasswordResponse = await _webportals.GetUserPasswordAsync(username);
                string hashedPassword = hashedPasswordResponse.return_value;
                    
                if (string.IsNullOrEmpty(hashedPassword))
                {
                    throw new Exception("Invalid username or password.");
                }

                bool isPasswordValid = false;
                try
                {
                    isPasswordValid = BCrypt.Net.BCrypt.Verify(password, hashedPassword);
                }
                catch (Exception)
                {
                    
                    isPasswordValid = false;
                }

                if (!isPasswordValid) throw new Exception("Invalid username or password.");

                var response = await _webportals.UserLoginAsync(username);
                var result = response.return_value;

                if (string.IsNullOrEmpty(result))
                {
                    throw new Exception("Failed to retrieve user details.");
                }

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var account = JsonSerializer.Deserialize<AccountDto>(result, options) ?? new AccountDto();

                var user = new User { EmailAddress = account.EmailAddress, Password = password };

                string accessToken = _authService.GenerateAccessToken(user);
                string refreshToken = _authService.GenerateRefreshToken();
                    
                   
                var tokenData = _authService.ValidateToken(accessToken);
                var expiresIn = (int)(tokenData.Expiration - DateTime.UtcNow).TotalSeconds;

                   
                bool isProfileUpdated = false;
                try
                {
                    var profileStatus = await _webportals.IsProfileUpdatedAsync(username);
                    isProfileUpdated = profileStatus.return_value;
                }
                catch
                {
                        
                    isProfileUpdated = false;
                }

                return Ok(new ApiResponse<TokenDto>
                {
                    Success = true,
                    Data = new TokenDto
                    {
                        AccessToken = accessToken,
                        RefreshToken = refreshToken,
                        ExpiresIn = expiresIn,
                        TokenType = "Bearer",
                        IsProfileUpdated = isProfileUpdated
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login error for {Username}", login?.username);
                return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message.StartsWith("Invalid") ? ex.Message : "An error occurred during login. Please try again." });
            }
        }
        

        [HttpPost("createaccount")]
        public async Task<IActionResult> CreateAccount(CreateAccountDto accountDto)
        {
            try
            {
                string firstName = accountDto.firstName;
                string lastName = accountDto.lastName;
                string middleName = accountDto.middleName ?? string.Empty;
                string idNumber = accountDto.idNumber;
                string emailAddress = accountDto.emailAddress;
                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(accountDto.password);

                
                var activationToken = _authService.GenerateActivationToken(emailAddress);


                string frontendUrl = Request.Headers["Origin"].ToString();
                if (string.IsNullOrEmpty(frontendUrl))
                {
                    frontendUrl = Request.Headers["Referer"].ToString();
                    if (!string.IsNullOrEmpty(frontendUrl) && frontendUrl.EndsWith("/"))
                    {
                        frontendUrl = frontendUrl.TrimEnd('/');
                    }
                }

            
                await _emailService.SendActivationEmailAsync(emailAddress, firstName, activationToken, frontendUrl);

                try
                {
                    
                    await _webportals.CreateOnlineUserAsync(emailAddress, firstName, middleName, lastName, idNumber, hashedPassword);
                }
                catch (Exception)
                {
                  
                    await _emailService.SendRegistrationFailedEmailAsync(emailAddress, firstName);
                    throw; 
                }

                return Ok(new ApiResponse<object> { Success = true, Message = "Account created successfully! A verification email has been sent to your inbox. Please activate your account to proceed." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Create account error");
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to create account. This email or ID number may already be in use." });
            }
        }

        [HttpPost("resetpassword")]
        public async Task<IActionResult> ResetPassword(LoginDto login)
        {
            try
            {
                string username = login.username;
                string password = BCrypt.Net.BCrypt.HashPassword(login.password);
                await _webportals.UpdateUserPasswordAsync(username, password);
                return Ok(new ApiResponse<object> { Success = true, Message = "Password has been updated successfully!" });
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Reset password error");
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to reset password. Please ensure the email is correct." });
            }
        }
        [HttpPost("activate")]
        public async Task<IActionResult> ActivateAccount([FromBody] ActivateAccountDto model)
        {
            try
            {
                if (model == null || string.IsNullOrEmpty(model.Token) || string.IsNullOrEmpty(model.Email))
                {
                    return BadRequest(new ApiResponse<object> { Success = false, Message = "Invalid activation request." });
                }

                // Validate token
                bool isValid = _authService.ValidateActivationToken(model.Token, model.Email);
                if (!isValid)
                {
                    return BadRequest(new ApiResponse<object> { Success = false, Message = "Invalid or expired activation token." });
                }

                // Activate user in NAV
                await _webportals.ActivateUserAccountAsync(model.Email);

                return Ok(new ApiResponse<object> { Success = true, Message = "Account activated successfully! You can now login." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Activation error");
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Activation failed. The link may have expired or is invalid." });
            }
        }
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                
                var username = User.Claims.FirstOrDefault(x => x.Type == "username")?.Value;
                if (string.IsNullOrEmpty(username)) return Unauthorized(new ApiResponse<object> { Success = false, Message = "User not found!" });

                var response = await _webportals.GetUserDetailsAsync(username);
                var result = response.return_value;

                var cleanedProfile = JsonUtilities.FlattenNavResponse(result);

                return Ok(new ApiResponse<object> { Success = true, Data = cleanedProfile });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get profile error");
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to load profile details." });
            }
        }
        [HttpPost("updateprofile")]
        public async Task<IActionResult> UpdateProfile(AccountDto account)
        {
            try
            {

                await _webportals.UpdateApplicantProfileAsync(
                 account.EmailAddress, 
            account.Initials ?? 0, 
                int.TryParse(account.PhoneNumber, out int phone) ? phone : 0,
                ((int)(account.Gender ?? 0)).ToString(), 
               ((int)(account.MaritalStatus ?? 0)).ToString(), 
                account.PostalCode,
                account.PostalAddress, 
                account.BirthDate ?? DateTime.MinValue, 
                account.Disability ?? false, 
                account.DisabilityStatus ?? "", 
                account.PwdNumber ?? "",
                account.Country
                );
                return Ok(new ApiResponse<object> { Success = true, Message = "Profile updated successfully!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Update profile error");
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Failed to update profile. Please ensure all required fields are valid." });
            }
        }

        [HttpPost("changepassword")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto model)
        {
            try
            {
                
                var username = User.Claims.FirstOrDefault(x => x.Type == "username")?.Value;
                if (string.IsNullOrEmpty(username)) return Unauthorized(new ApiResponse<object> { Success = false, Message = "User not found!" });

            
                var hashedPasswordResponse = await _webportals.GetUserPasswordAsync(username);
                string currentHashedPassword = hashedPasswordResponse.return_value;

                if (string.IsNullOrEmpty(currentHashedPassword))
                {
                    throw new Exception("Could not verify current password.");
                }

                bool isCurrentPasswordValid = false;
                try
                {
                    isCurrentPasswordValid = BCrypt.Net.BCrypt.Verify(model.CurrentPassword, currentHashedPassword);
                }
                catch (Exception)
                {
                    isCurrentPasswordValid = false;
                }

                if (!isCurrentPasswordValid)
                {
                    throw new Exception("The current password provided is incorrect.");
                }

               
                string newHashedPassword = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);

             
                await _webportals.UpdateUserPasswordAsync(username, newHashedPassword);
                var userDetailsResponse = await _webportals.GetUserDetailsAsync(username);
                var userDetailsJson = userDetailsResponse.return_value;
                var userDetails = JsonUtilities.FlattenNavResponse(userDetailsJson);
                
                string email = userDetails["EmailAddress"]?.ToString() ?? "";
                string firstName = userDetails["FirstName"]?.ToString() ?? "User";

                if (!string.IsNullOrEmpty(email))
                {
                     await _emailService.SendPasswordChangeNotificationAsync(email, firstName);
                }

                return Ok(new ApiResponse<object> { Success = true, Message = "Password changed successfully!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Change password error");
                return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message.Contains("Incorrect") || ex.Message.Contains("Could not verify") ? ex.Message : "Failed to change password. Please try again later." });
            }
        }
    }
}
