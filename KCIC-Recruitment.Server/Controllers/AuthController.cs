using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using Recruitment.Server.DTOs;
using Recruitment.Server.Interfaces;
using Recruitment.Server.Models;
using Recruitment.Server.Services;
using Recruitment.Server.Utilities;

namespace Recruitment.Server.Controllers
{
    [ApiController]
    [Route("/api/auth")]
    public class AuthController(IAuthService authService, IRecruitmentService bc, IEmailService emailService, ILogger<AuthController> logger) : Controller
    {
        private readonly IAuthService _authService = authService;
        private readonly IEmailService _emailService = emailService;
        private readonly ILogger<AuthController> _logger = logger;
        private readonly IRecruitmentService _bc = bc;
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto login)
        {
            try
            {
                string username = login.username;
                string password = login.password;

                string hashedPassword = await _bc.GetUserPasswordAsync(username);

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

                string result;
                try
                {
                    result = await _bc.UserLoginAsync(username);
                }
                // Codeunit 70007 UserLogin: "Account is not activated. Please check your email."
                catch (BusinessCentralException ex) when (ex.Message.Contains("not activated", StringComparison.OrdinalIgnoreCase))
                {
                    // Self-service recovery when the original activation email was lost or never sent.
                    try
                    {
                        var name = JsonUtilities.FlattenNavResponse(await _bc.GetUserDetailsAsync(username))["FirstName"]?.ToString() ?? string.Empty;
                        await _emailService.SendActivationEmailAsync(username, name, _authService.GenerateActivationToken(username), FrontendUrl());
                        return BadRequest(new ApiResponse<object> { Success = false, Message = $"{ex.Message} A new activation link has been sent to your email address." });
                    }
                    catch (Exception mailError)
                    {
                        _logger.LogError(mailError, "Could not resend activation email to {Username}", username);
                        return BadRequest(new ApiResponse<object> { Success = false, Message = $"{ex.Message} Sending a new activation link failed: {ErrorText.From(mailError)}" });
                    }
                }

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

                   
                // Codeunit 70007 IsProfileUpdated only checks for a saved application, so derive it from the profile itself.
                bool isProfileUpdated = false;
                try
                {
                    isProfileUpdated = IsProfileComplete(JsonUtilities.FlattenNavResponse(await _bc.GetUserDetailsAsync(username)));
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Could not check profile completeness for {Username}", username);
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
                return BadRequest(new ApiResponse<object> { Success = false, Message = ErrorText.From(ex) });
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


                // Create the BC account first so applicants never get an activation link for an account that failed.
                await _bc.CreateOnlineUserAsync(emailAddress, firstName, middleName, lastName, idNumber, hashedPassword);
                try
                {
                    await _emailService.SendActivationEmailAsync(emailAddress, firstName, activationToken, FrontendUrl());
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Activation email failed for new account {Email}", emailAddress);
                    return Ok(new ApiResponse<object> { Success = true, Message = $"Account created, but the activation email failed: {ErrorText.From(ex)}" });
                }

                return Ok(new ApiResponse<object> { Success = true, Message = "Account created successfully! A verification email has been sent to your inbox. Please activate your account to proceed." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Create account error");
                return BadRequest(new ApiResponse<object> { Success = false, Message = ErrorText.From(ex) });
            }
        }

        private string FrontendUrl()
        {
            var url = Request.Headers["Origin"].ToString();
            if (string.IsNullOrEmpty(url)) url = Request.Headers["Referer"].ToString();
            return url.TrimEnd('/');
        }

        [HttpPost("resetpassword")]
        public async Task<IActionResult> ResetPassword(LoginDto login)
        {
            try
            {
                string username = login.username;
                string password = BCrypt.Net.BCrypt.HashPassword(login.password);
                await _bc.UpdateUserPasswordAsync(username, password);
                return Ok(new ApiResponse<object> { Success = true, Message = "Password has been updated successfully!" });
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Reset password error");
                return BadRequest(new ApiResponse<object> { Success = false, Message = ErrorText.From(ex) });
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
                await _bc.ActivateUserAccountAsync(model.Email);

                return Ok(new ApiResponse<object> { Success = true, Message = "Account activated successfully! You can now login." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Activation error");
                return BadRequest(new ApiResponse<object> { Success = false, Message = ErrorText.From(ex) });
            }
        }
        /// <summary>
        /// A profile is complete once the fields used to prefill applications are filled in. Gender is
        /// not checked because BC always reports one (its first option, Male, is the default), and a
        /// blank phone number is stored as "0".
        /// </summary>
        private static bool IsProfileComplete(System.Text.Json.Nodes.JsonObject profile) =>
            !string.IsNullOrWhiteSpace(BcValue.PhoneForDisplay(BcJson.Text(profile, "TelephoneNo"))) &&
            new[] { "DateOfBirth", "PostalAddress", "Country" }.All(key => !string.IsNullOrWhiteSpace(BcJson.Text(profile, key)));

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                
                var username = User.Claims.FirstOrDefault(x => x.Type == "username")?.Value;
                if (string.IsNullOrEmpty(username)) return Unauthorized(new ApiResponse<object> { Success = false, Message = "User not found!" });

                var result = await _bc.GetUserDetailsAsync(username);

                var cleanedProfile = JsonUtilities.FlattenNavResponse(result);
                cleanedProfile["TelephoneNo"] = BcValue.PhoneForDisplay(BcJson.Text(cleanedProfile, "TelephoneNo"));
                // Gender always reads "Male" until the applicant saves a profile (Male is BC's first option).
                if (!IsProfileComplete(cleanedProfile)) cleanedProfile["Gender"] = string.Empty;

                return Ok(new ApiResponse<object> { Success = true, Data = cleanedProfile });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get profile error");
                return BadRequest(new ApiResponse<object> { Success = false, Message = ErrorText.From(ex) });
            }
        }
        [Authorize]
        [HttpPost("updateprofile")]
        public async Task<IActionResult> UpdateProfile(AccountDto account)
        {
            try
            {
                var username = User.Claims.FirstOrDefault(x => x.Type == "username")?.Value;
                if (string.IsNullOrEmpty(username)) return Unauthorized(new ApiResponse<object> { Success = false, Message = "User not found!" });

                if (account.Gender is not ("Male" or "Female"))
                    return BadRequest(new ApiResponse<object> { Success = false, Message = "Select your gender." });

                // UpdateApplicantProfile overwrites every profile field, so the form always sends all of them.
                await _bc.UpdateApplicantProfileAsync(
                    username,
                    AccountDto.SalutationCode(account.Salutation),
                    BcValue.Phone(account.PhoneNumber, "Phone number"),
                    account.Gender,
                    account.MaritalStatus ?? string.Empty,
                    account.PostalCode ?? string.Empty,
                    account.PostalAddress ?? string.Empty,
                    account.BirthDate ?? DateTime.MinValue,
                    account.Disability,
                    account.Disability ? account.DisabilityStatus ?? string.Empty : string.Empty,
                    account.Disability ? account.PwdNumber ?? string.Empty : string.Empty,
                    account.Country ?? string.Empty);
                return Ok(new ApiResponse<object> { Success = true, Message = "Profile updated successfully!" });
            }
            catch (PortalValidationException ex)
            {
                return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Update profile error");
                return BadRequest(new ApiResponse<object> { Success = false, Message = ErrorText.From(ex) });
            }
        }

        [Authorize]
        [HttpPost("changepassword")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto model)
        {
            try
            {
                
                var username = User.Claims.FirstOrDefault(x => x.Type == "username")?.Value;
                if (string.IsNullOrEmpty(username)) return Unauthorized(new ApiResponse<object> { Success = false, Message = "User not found!" });

            
                string currentHashedPassword = await _bc.GetUserPasswordAsync(username);

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

             
                await _bc.UpdateUserPasswordAsync(username, newHashedPassword);
                var userDetailsJson = await _bc.GetUserDetailsAsync(username);
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
                return BadRequest(new ApiResponse<object> { Success = false, Message = ErrorText.From(ex) });
            }
        }
    }
}
