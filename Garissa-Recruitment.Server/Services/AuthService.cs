using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Recruitment.Server.DTOs;
using Recruitment.Server.Interfaces;
using Recruitment.Server.Models;

namespace Recruitment.Server.Services
{
    public class AuthService(IConfiguration config) : IAuthService
    {
        private readonly string _key = config["Jwt:Key"] ?? "a-very-long-secret-key-from-the-app";
        private readonly string _issuer = config["Jwt:Issuer"] ?? "Garissa University";
        private readonly string _audience = config["Jwt:Audience"] ?? "Garissa University Recruitment Users";
        private readonly string _expires = config["Jwt:Expires"] ?? "1";
        public string GenerateAccessToken(User user)
        {
            try
            {
                // Get data from the models
                string username = user.EmailAddress;
                string password = user.Password;

                // Create claims to store the data
                var claims = new List<Claim>
                {
                    new Claim("username",username)
                };

                // Create security key frm secret
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_key));
                var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);

                // Create an access token
                var token = new JwtSecurityToken(issuer: _issuer, audience: _audience, claims: claims, expires: DateTime.Now.AddHours(int.Parse(_expires)), signingCredentials: credentials);

                // Return serialized token
                return new JwtSecurityTokenHandler().WriteToken(token);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        public TokenData ValidateToken(string token)
        {
            try
            {
                if (string.IsNullOrEmpty(token)) throw new Exception("Token cannot be null!");

                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_key);

                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _issuer,
                    ValidateAudience = true,
                    ValidAudience = _audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;

                // Extract data from the token
                var tokenData = new TokenData()
                {
                    Username = jwtToken.Claims.First(x => x.Type == "username").Value,
                    Expiration = jwtToken.ValidTo,
                    Token = token
                };
                return tokenData;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public string GenerateActivationToken(string email)
            {
                try
                {
                    var claims = new List<Claim>
                    {
                        new Claim("email", email),
                        new Claim("type", "activation")
                    };

                    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_key));
                    var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);

                    // Activation token valid for 24 hours
                    var token = new JwtSecurityToken(
                        issuer: _issuer,
                        audience: _audience,
                        claims: claims,
                        expires: DateTime.UtcNow.AddHours(24),
                        signingCredentials: credentials);

                    return new JwtSecurityTokenHandler().WriteToken(token);
                }
                catch (Exception ex)
                {
                    throw new Exception($"Failed to generate activation token: {ex.Message}");
                }
            }

            public bool ValidateActivationToken(string token, string email)
            {
                try
                {
                    if (string.IsNullOrEmpty(token)) return false;

                    var tokenHandler = new JwtSecurityTokenHandler();
                    var key = Encoding.UTF8.GetBytes(_key);

                    tokenHandler.ValidateToken(token, new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(key),
                        ValidateIssuer = true,
                        ValidIssuer = _issuer,
                        ValidateAudience = true,
                        ValidAudience = _audience,
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.Zero
                    }, out SecurityToken validatedToken);

                    var jwtToken = (JwtSecurityToken)validatedToken;
                    var emailClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == "email")?.Value;
                    var typeClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == "type")?.Value;

                    return emailClaim == email && typeClaim == "activation";
                }
                catch
                {
                    return false;
                }
            }
    }
}
