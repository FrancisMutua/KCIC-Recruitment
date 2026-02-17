using Recruitment.Library.Interfaces;
using Recruitment.Library.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Recruitment.Library.Services
{
    public class HelperService(IAuthService authService) : IHelperService
    {
        private readonly IAuthService _authService=authService;
        public TokenData? ValidateTokenData(string token)
        {
            try
            {
                // Validate token presence
                if (string.IsNullOrWhiteSpace(token)) throw new Exception("Authentication token is required. Please provide a valid access token.");

                // Validate token
                var tokenData = _authService.ValidateAccessToken(token) ?? throw new Exception("Invalid authentication token.");

                // Check token expiration
                if (tokenData.Expiration < DateTime.UtcNow) throw new Exception("Your session has expired.");

                // Validate required token data
                if (string.IsNullOrWhiteSpace(tokenData.Username)) throw new Exception("Authentication failed. Token is missing required user information.");
                return tokenData;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}
