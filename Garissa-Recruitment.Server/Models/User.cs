namespace Recruitment.Server.Models
{
    public class User
    {
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string EmailAddress { get; set; }
        public string Password { get; set; }
        public string IdNumber { get; set; }
        public Enums.MaritalStatus MaritalStatus { get; set; }
        public Enums.EmployeeGender Gender { get; set; }
        public string PhoneNo { get; set; }
    }
}
