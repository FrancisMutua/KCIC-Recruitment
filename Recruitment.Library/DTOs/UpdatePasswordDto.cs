using System;
using System.Collections.Generic;
using System.Text;

namespace Recruitment.Library.DTOs
{
    public class UpdatePasswordDto
    {
        public string emailAddress { get; set; }
        public string password { get; set; }
    }
}
