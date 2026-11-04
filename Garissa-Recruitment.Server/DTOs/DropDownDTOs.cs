using System.Collections.Generic;

namespace Recruitment.Server.DTOs
{
    public class DropDownRequest
    {
        public string Page { get; set; } = string.Empty;
        public string Code { get; set; } = "Code";
        public string Description { get; set; } = "Description";
        public int Merge { get; set; } = 1;
        public Dictionary<string, object>? Filters { get; set; }
        
        // Added to support multiple sources
        public string Source { get; set; } = "OData"; // "OData" or "SOAP"
        public string Type { get; set; } = string.Empty; // e.g. "County" for SOAP
    }

    public class DropDownOption
    {
        public string? Text { get; set; }
        public string? Value { get; set; }
        public string? Code { get; set; }
        public string? Description { get; set; }
    }
}
