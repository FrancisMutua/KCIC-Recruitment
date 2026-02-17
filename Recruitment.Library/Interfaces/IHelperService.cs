using Recruitment.Library.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Recruitment.Library.Interfaces
{
    public interface IHelperService
    {
        TokenData? ValidateTokenData(string token);
    }
}
