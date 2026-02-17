using System;
using System.Collections.Generic;
using System.Text;

namespace Recruitment.Library.DTOs
{
    public class FileDto
    {
        public string fileName { get; set; }
        public string fileExtension { get; set; }
        public string base64String { get; set; }
        public string documentNo { get; set; }
        public string token { get; set; }
    }
}
