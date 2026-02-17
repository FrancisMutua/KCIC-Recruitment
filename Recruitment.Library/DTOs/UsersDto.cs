using System;
using System.Collections.Generic;
using System.Text;

namespace Recruitment.Library.DTOs
{
    public class UsersDto
    {
        public string emailAddress { get; set; }
        public string firstName { get; set; }
        public string middleName { get; set; }
        public string lastName { get; set; }
        public string dateOfBirth { get; set; }
        public string idNumber { get; set; }
        public string telephoneNo { get; set; }
        public string postCode { get; set; }
        public string postalAddress { get; set; }
        public string gender { get; set; }
        public string maritalStatus { get; set; }
    }
}
