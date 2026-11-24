using System.Text.Json.Serialization;

namespace Recruitment.Server.DTOs
{
    public class SubmitApplicationDto
    {
        public string JobId { get; set; } = string.Empty;
        public string RequisitionNo { get; set; } = string.Empty;
    }

    /// <summary>Row from GetAdvertisedJobs (HRM-Employee Requisitions, Approved + Advertised).</summary>
    public class JobDto
    {
        [JsonPropertyName("documentNo")]
        public string DocumentNo { get; set; } = string.Empty;

        [JsonPropertyName("documentDate")]
        public string DocumentDate { get; set; } = string.Empty;

        [JsonPropertyName("jobId")]
        public string JobId { get; set; } = string.Empty;

        [JsonPropertyName("jobTitle")]
        public string JobTitle { get; set; } = string.Empty;

        [JsonPropertyName("vacancy")]
        public decimal Vacancy { get; set; }

        [JsonPropertyName("startDate")]
        public string StartDate { get; set; } = string.Empty;

        [JsonPropertyName("endDate")]
        public string EndDate { get; set; } = string.Empty;

        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        [JsonPropertyName("purpose")]
        public string Purpose { get; set; } = string.Empty;

        /// <summary>Documents applicants must attach (portal configuration).</summary>
        [JsonPropertyName("requiredDocuments")]
        public List<JobRequirementDto> RequiredDocuments { get; set; } = [];
    }

    public class JobDetailsDto
    {
        [JsonPropertyName("requirements")]
        public List<JobRequirementDto> Requirements { get; set; } = [];

        [JsonPropertyName("responsibilities")]
        public List<JobResponsibilityDto> Responsibilities { get; set; } = [];

        [JsonPropertyName("competencies")]
        public List<JobRequirementDto> Competencies { get; set; } = [];

        [JsonPropertyName("jobInfo")]
        public JobDto JobInfo { get; set; } = new();
    }

    public class JobRequirementDto
    {
        [JsonPropertyName("code")]
        public string Code { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;
    }

    public class JobResponsibilityDto
    {
        [JsonPropertyName("code")]
        public string Code { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;
    }
}
