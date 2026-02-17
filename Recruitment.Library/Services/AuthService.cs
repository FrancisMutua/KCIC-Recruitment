using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Recruitment.Library.DTOs;
using Recruitment.Library.Interfaces;
using Recruitment.Library.Models;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Recruitment.Library.Services
{
    public class AuthService(IConfiguration config) : IAuthService
    {
        private readonly string secretKey = config["Jwt:Key"]!;
        private readonly string issuer = config["Jwt:Issuer"]!;
        private readonly string audience = config["Jwt:Audience"]!;
        private readonly int expiration = int.Parse(config["Jwt:Expiration"]!);
        public string GenerateAccessToken(LoginDto login)
        {
            try
            {
                // 1. Extract the user identity from the login model
                string username = login.username;

                // 2. Define the 'Claims' (Payload data). 
                // These are pieces of information about the user that will be encoded into the token.
                var claims = new List<Claim> { new("username", username) };

                // 3. Set up the signing key using the secret key from configuration.
                // We use SymmetricSecurityKey because the same key is used for both signing and verifying.
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

                // 4. Define the signing credentials using the HMAC SHA256 algorithm
                var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);

                // 5. Construct the JWT Object
                var token = new JwtSecurityToken(issuer, audience, claims, expires: DateTime.UtcNow.AddHours(expiration), signingCredentials: credentials);

                // 6. Convert the JwtSecurityToken object into a compact, URL-safe string (Header.Payload.Signature)
                return new JwtSecurityTokenHandler().WriteToken(token);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public TokenData ValidateAccessToken(string token)
        {
            try
            {
                // 1. Guard Clause: Ensure the token is provided before attempting to process it
                if (string.IsNullOrEmpty(token)) throw new Exception("Token cannot be null!");

                // 2. Initialize the JWT handler and prepare the security key
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(secretKey);

                // 3. Perform the actual validation against the token.
                // This will check if the signature is valid, the issuer/audience match, 
                // and if the token is within its expiration window.
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true, // Verify the signature matches our secret key
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true, // Ensure the token was issued by our trusted server
                    ValidIssuer = issuer,
                    ValidateAudience = true, // Ensure the token was intended for our application
                    ValidAudience = audience,
                    ValidateLifetime = true, // Check if the token has expired
                    ClockSkew = TimeSpan.Zero // Remove the default 5-minute grace period for expiration
                }, out SecurityToken validatedToken);

                // 4. Cast the generic SecurityToken to a JwtSecurityToken to access specific claims
                var jwtToken = (JwtSecurityToken)validatedToken;

                // 5. Extract data from the token claims and map it to a custom DTO (Data Transfer Object)
                var tokenData = new TokenData()
                {
                    // Searches for the "username" claim; will throw an exception if not found
                    Username = jwtToken.Claims.First(x => x.Type == "username").Value,

                    // Maps the standard JWT expiration date
                    Expiration = jwtToken.ValidTo,

                    // Return the original token string
                    Token = token
                };
                return tokenData;
            }
            catch (Exception ex)
            {
                // Note: If ValidateToken fails (expired, invalid signature, etc.), it throws an exception.
                throw new Exception(ex.Message);
            }
        }
    }
}
