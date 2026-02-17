using Recruitment.Library.DTOs;
using Recruitment.Library.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Recruitment.Library.Interfaces
{
    public interface IAuthService
    {
        string GenerateAccessToken(LoginDto login);
        TokenData ValidateAccessToken(string token);
    }
}
