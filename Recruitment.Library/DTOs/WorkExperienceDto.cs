using System;
using System.Collections.Generic;
using System.Text;

namespace Recruitment.Library.DTOs
{
    public class WorkExperienceDto
    {
        public int lineNo { get; set; } = 0;
        public string position { get; set; }
        public string institution { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
        public string id { get; set; } = string.Empty;
        public string token { get; set; }
        public string documentNo { get; set; } 
    }
}
