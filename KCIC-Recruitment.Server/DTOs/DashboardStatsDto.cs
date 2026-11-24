namespace Recruitment.Server.DTOs
{
    /// <summary>Shape of GetApplicationStatistics.</summary>
    public class DashboardStatsDto
    {
        public int TotalOpenings { get; set; }
        public decimal TotalOpenPositions { get; set; }
        public int TotalApplications { get; set; }
        public int SubmittedApplications { get; set; }
        public int SuccessfulApplications { get; set; }
        public int DraftApplications => Math.Max(0, TotalApplications - SubmittedApplications);
        public string LastApplicationNo { get; set; } = string.Empty;
        public string LastApplicationDate { get; set; } = string.Empty;
        public string LastApplicationStatus { get; set; } = string.Empty;
    }
}
