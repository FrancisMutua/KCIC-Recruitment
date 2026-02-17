using System;
using System.Collections.Generic;
using System.Text;

namespace Recruitment.Library.DTOs
{
    public class RelationshipDto
    {
        public string firstName { get; set; }
        public string middleName { get; set; } = string.Empty;
        public string lastName { get; set; }
        public int phoneNo { get; set; }
        public string email { get; set; }
        public string institution { get; set; }
        public string id { get; set; } = string.Empty;
        public string relationship { get; set; } = string.Empty;
        public string type { get; set; }
        public DateTime birthDate { get; set; } = DateTime.Now;
        public string token { get; set; }
        public string documentNo { get; set; }
    }
}
