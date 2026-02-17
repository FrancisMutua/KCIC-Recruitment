using System;
using System.Collections.Generic;
using System.Text;

namespace Recruitment.Library.DTOs
{
    public class QualificationDto
    {
        public int lineNo { get; set; }
        public string applicationNo { get; set; }
        public string code { get; set; }
        public string description { get; set; }
        public string institution { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
        public string grade { get; set; }
        public string id { get; set; }
        public string areaOfStudy { get; set; }
    }
}
