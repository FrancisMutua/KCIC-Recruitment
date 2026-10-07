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
        public string Purpose { get; set; } = string.Empty;
        public string JobGrade { get; set; } = string.Empty;
        public string DepartmentCode { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public string ReportingTo { get; set; } = string.Empty;
        public string ReportingToName { get; set; } = string.Empty;
        public string JobSpecialization { get; set; } = string.Empty;
        public string TermsOfService { get; set; } = string.Empty;
        public string RequisitionType { get; set; } = string.Empty;
        public decimal? BasicSalary { get; set; }
        public decimal? Allowances { get; set; }
        public string DutyStation { get; set; } = string.Empty;
        public string EmploymentTerms { get; set; } = string.Empty;
        public bool AcademicJob { get; set; }
        public bool ProfessionalTrainingRequired { get; set; }
        public System.Text.Json.JsonElement RequiredDocuments { get; set; } = System.Text.Json.JsonSerializer.SerializeToElement(Array.Empty<object>());
        public System.Text.Json.JsonElement Questions { get; set; } = System.Text.Json.JsonSerializer.SerializeToElement(Array.Empty<object>());
        public System.Text.Json.JsonElement AllowanceDetails { get; set; } = System.Text.Json.JsonSerializer.SerializeToElement(Array.Empty<object>());

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

    public class JobAdvertDto : JobDto
    {
        public string Requirements { get; set; } = string.Empty;
        public string Responsibilities { get; set; } = string.Empty;
        public string Competencies { get; set; } = string.Empty;
    }

    public class JobDetailsDto
    {
        public List<JobRequirementDto> Competencies { get; set; } = new();
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
