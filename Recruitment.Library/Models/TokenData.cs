using System;
using System.Collections.Generic;
using System.Text;

namespace Recruitment.Library.Models
{
    public class TokenData
    {
        public string? Username { get; set; }
        public DateTime Expiration { get; set; }
        public bool IsExpired => DateTime.UtcNow > Expiration;
        public string? Token { get; set; }
    }
}
