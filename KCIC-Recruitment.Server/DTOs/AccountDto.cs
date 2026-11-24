using System.Text.Json.Serialization;

namespace Recruitment.Server.DTOs
{
    /// <summary>
    /// Applicant account profile, stored by codeunit 70007 UpdateApplicantProfile on the user's
    /// sentinel row in "HRM-Job Applications (B)". Also read back from UserLogin (EmailAddress).
    /// </summary>
    public class AccountDto
    {
        [JsonPropertyName("emailAddress")]
        public string EmailAddress { get; set; } = string.Empty;

        /// <summary>Salutation text: Prof, Dr, Mr., Mrs., Miss, Ms. or Rev.</summary>
        [JsonPropertyName("salutation")]
        public string Salutation { get; set; } = string.Empty;

        [JsonPropertyName("phoneNumber")]
        public string PhoneNumber { get; set; } = string.Empty;

        /// <summary>"Male" or "Female".</summary>
        [JsonPropertyName("gender")]
        public string Gender { get; set; } = string.Empty;

        /// <summary>Single, Married, Divorced, Widow, Widower or Complicated.</summary>
        [JsonPropertyName("maritalStatus")]
        public string MaritalStatus { get; set; } = string.Empty;

        [JsonPropertyName("postalCode")]
        public string PostalCode { get; set; } = string.Empty;

        [JsonPropertyName("postalAddress")]
        public string PostalAddress { get; set; } = string.Empty;

        [JsonPropertyName("birthDate")]
        public DateTime? BirthDate { get; set; }

        [JsonPropertyName("disability")]
        public bool Disability { get; set; }

        [JsonPropertyName("disabilityStatus")]
        public string DisabilityStatus { get; set; } = string.Empty;

        [JsonPropertyName("pwdNumber")]
        public string PwdNumber { get; set; } = string.Empty;

        [JsonPropertyName("country")]
        public string Country { get; set; } = string.Empty;

        /// <summary>Codeunit 70007 TitleFromInt: 1 Prof, 2 Dr, 3 Mr., 4 Mrs., 5 Miss, 6 Ms., 7 Rev.</summary>
        public static int SalutationCode(string? salutation) =>
            (salutation ?? string.Empty).Trim().TrimEnd('.').ToLowerInvariant() switch
            {
                "prof" => 1,
                "dr" => 2,
                "mr" => 3,
                "mrs" => 4,
                "miss" => 5,
                "ms" => 6,
                "rev" => 7,
                _ => 0
            };
    }
}
