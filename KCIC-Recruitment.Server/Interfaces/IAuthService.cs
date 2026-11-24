using Recruitment.Server.DTOs;
using Recruitment.Server.Models;

namespace Recruitment.Server.Interfaces
{
    public interface IAuthService
    {
        string GenerateAccessToken(User user);
        string GenerateRefreshToken();
        TokenData ValidateToken(string token);
        string GenerateActivationToken(string email);
        bool ValidateActivationToken(string token, string email);
    }
}
