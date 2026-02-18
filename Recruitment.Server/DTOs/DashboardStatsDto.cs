using System.Text.Json.Serialization;

namespace Recruitment.Server.DTOs
{
    public class DashboardStatsDto
    {
        public int TotalOpenings { get; set; }
        
        public int TotalApplications { get; set; }
        
        public int SuccessfulApplications { get; set; }

        public int SubmittedApplications { get; set; }
    }
}
