namespace Recruitment.Server.DTOs
{
    public class CreateAccountDto
    {
        public string firstName { get; set; }
        public string middleName { get; set; }
        public string lastName { get; set; }
        public string emailAddress { get; set; }
        public string password { get; set; }
        public string idNumber { get; set; }
    }
}
