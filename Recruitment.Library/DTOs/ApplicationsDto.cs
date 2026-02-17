using System;
using System.Collections.Generic;
using System.Text;

namespace Recruitment.Library.DTOs
{
    public class ApplicationsDto
    {
        public string documentNo { get; set; }
        public string documentDate { get; set; }
        public string referenceNo { get; set; }
        public string jobId { get; set; }
        public string jobTitle { get; set; }
        public string status { get; set; }
        public string evaluationStatus { get; set; }
        public string token { get; set; }
        public bool recommend { get; set; }
        public bool recommendationAccepted { get; set; }
    }
}
