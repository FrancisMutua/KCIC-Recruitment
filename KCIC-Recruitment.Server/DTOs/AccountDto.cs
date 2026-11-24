using System.Text.Json.Serialization;

namespace Recruitment.Server.DTOs
{
    /// <summary>Applicant profile (BC table OnlineUsers).</summary>
    public class AccountDto
    {
        [JsonPropertyName("emailAddress")]
        public string EmailAddress { get; set; } = string.Empty;

        [JsonPropertyName("phoneNumber")]
        public string PhoneNumber { get; set; } = string.Empty;

        /// <summary>OnlineUsers.Gender option index: 1 Male, 2 Female.</summary>
        [JsonPropertyName("gender")]
        public int? Gender { get; set; }

        /// <summary>OnlineUsers."Marital Status" option index: 0 Single, 1 Married.</summary>
        [JsonPropertyName("maritalStatus")]
        public int? MaritalStatus { get; set; }

        [JsonPropertyName("postalAddress")]
        public string PostalAddress { get; set; } = string.Empty;

        [JsonPropertyName("birthDate")]
        public DateTime? BirthDate { get; set; }

        [JsonPropertyName("country")]
        public string Country { get; set; } = string.Empty;
    }
}
