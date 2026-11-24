namespace Recruitment.Server.DTOs
{
    /// <summary>Dashboard counts for the signed-in applicant.</summary>
    public class DashboardStatsDto
    {
        /// <summary>Adverts currently open (same list as the job board).</summary>
        public int TotalOpenings { get; set; }
        public int TotalApplications { get; set; }
        /// <summary>Applications sent to HR (any status other than New).</summary>
        public int SubmittedApplications { get; set; }
        public int SuccessfulApplications { get; set; }
        public int DraftApplications { get; set; }
    }
}
