using System;
using System.Collections.Generic;
using System.Text;

namespace Recruitment.Library.DTOs
{
    public class UpdateProfileDto
    {
        public int initials { get; set; } 
        public string firstName { get; set; } 
        public string? middleName { get; set; }
        public string lastName { get; set; } 
        public string emailAddress { get; set; } 
        public string idNumber { get; set; } 
        public int telNo { get; set; } 
        public int altTelNo { get; set; }
        public string postCode { get; set; }
        public string postalAddress { get; set; }
        public string country { get; set; } 
        public string county { get; set; }
        public string subCounty { get; set; }
        public string gender { get; set; } 
        public string maritalStatus { get; set; } 
        public DateTime dateOfBirth { get; set; }
        public string ethnicity { get; set; }
        public string kraPin { get; set; }
        public bool isPwd { get; set; }
        public string? pwdNo { get; set; } = string.Empty;
        public string? disabilityType { get; set; } = string.Empty;
        public string token { get; set; }
    }
}
