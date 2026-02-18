using System.Text.Json.Serialization;

namespace Recruitment.Server.DTOs
{
    
    
    
    public class SubmitApplicationDto
    {
        public string Username { get; set; }
        public string JobId { get; set; }
        public string RequisitionNo { get; set; }
    }
    public class JobDto
    {
        [JsonPropertyName("documentNo")]
        public string DocumentNo { get; set; }

        [JsonPropertyName("documentDate")]
        public string DocumentDate { get; set; }

        [JsonPropertyName("jobId")]
        public string JobId { get; set; }

        [JsonPropertyName("jobTitle")]
        public string JobTitle { get; set; }

        [JsonPropertyName("vacancy")]
        public int Vacancy { get; set; }

        [JsonPropertyName("startDate")]
        public string StartDate { get; set; }

        [JsonPropertyName("endDate")]
        public string EndDate { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; }
    }

    public class JobDetailsDto
    {
        [JsonPropertyName("requirements")]
        public List<JobRequirementDto> Requirements { get; set; } = new();

        [JsonPropertyName("responsibilities")]
        public List<JobResponsibilityDto> Responsibilities { get; set; } = new();

        [JsonPropertyName("jobInfo")]
        public JobDto JobInfo { get; set; }
    }

    public class JobRequirementDto
    {
        [JsonPropertyName("code")]
        public string Code { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }
    }

    public class JobResponsibilityDto
    {
        [JsonPropertyName("code")]
        public string Code { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }
    }
}
