using System;
using System.Collections.Generic;
using System.Text;

namespace Recruitment.Library.DTOs
{
    public class AdvertisedJobsDto
    {
        public string documentNo { get; set; }
        public DateTime documentDate { get; set; }
        public string jobId { get; set; }
        public string jobTitle { get; set; }
        public decimal vacancy { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
        public string status { get; set; }
    }
}
