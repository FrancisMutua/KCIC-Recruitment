using System;
using System.Collections.Generic;
using System.Text;

namespace Recruitment.Library.DTOs
{
    public class CreateAccountDto
    {
        public string firstName { get; set; }
        public string middleName { get; set; }=string.Empty;
        public string lastName { get; set; }
        public string idNumber { get; set; }
        public int telNo { get; set; }
        public string emailAddress { get; set; }
        public string requestLink { get; set; }
    }
}
