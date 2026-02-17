using System;
using System.Collections.Generic;
using System.Text;

namespace Recruitment.Library.DTOs
{
    public class DocumentsDto
    {
        public string fileName { get; set; }
        public string fileExtension { get; set; }
        public string base64String { get; set; }
        public DateTime documentDate { get; set; }
        public string id { get; set; }
    }
}
