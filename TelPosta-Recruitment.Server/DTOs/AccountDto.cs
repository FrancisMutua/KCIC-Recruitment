using System.Text.Json.Serialization;

namespace Recruitment.Server.DTOs
{
    public class AccountDto
    {
        [JsonPropertyName("emailAddress")]
        public string EmailAddress { get; set; }

        [JsonPropertyName("firstName")]
        public string FirstName { get; set; }

        [JsonPropertyName("middleName")]
        public string MiddleName { get; set; }

        [JsonPropertyName("lastName")]
        public string LastName { get; set; }

        [JsonPropertyName("idNumber")]
        public string IdNumber { get; set; }

        [JsonPropertyName("initials")]
        public int? Initials { get; set; }

        [JsonPropertyName("phoneNumber")]
        public string PhoneNumber { get; set; }

        [JsonPropertyName("gender")]
        public Models.Enums.EmployeeGender? Gender { get; set; }

        [JsonPropertyName("maritalStatus")]
        public Models.Enums.MaritalStatus? MaritalStatus { get; set; }

        [JsonPropertyName("postalCode")]
        public string PostalCode { get; set; }

        [JsonPropertyName("postalAddress")]
        public string PostalAddress { get; set; }

        [JsonPropertyName("birthDate")]
        public DateTime? BirthDate { get; set; }

        [JsonPropertyName("disability")]
        public bool? Disability { get; set; }

        [JsonPropertyName("disabilityStatus")]
        public string DisabilityStatus { get; set; }

        [JsonPropertyName("pwdNumber")]
        public string PwdNumber { get; set; }

        [JsonPropertyName("country")]
        public string Country { get; set; }
    }
}
