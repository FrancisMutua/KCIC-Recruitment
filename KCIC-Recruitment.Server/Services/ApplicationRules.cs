using Recruitment.Server.Models;

namespace Recruitment.Server.Services
{
    /// <summary>Portal rules layered on top of codeunit 70007 (status labels, document tagging).</summary>
    public static class ApplicationRules
    {
        /// <summary>Table "HRM-Job Applications (B)": the Document Attachment table ID GetAttachedDocuments reads.</summary>
        public const int JobApplicationsTableId = 52179114;

        private const string CategorySeparator = "__";

        /// <summary>
        /// "HRM-Job Applications (B)".Status is New,Submitted,Processing,"Not Successful",Successful.
        /// New is a draft the applicant can still edit; everything else is read-only.
        /// </summary>
        public static bool IsSubmitted(string? bcStatus) =>
            !string.IsNullOrWhiteSpace(bcStatus) && !string.Equals(bcStatus.Trim(), "New", StringComparison.OrdinalIgnoreCase);

        /// <summary>Applicant-facing status label for a BC Status value.</summary>
        public static string CandidateStatus(string? bcStatus) => (bcStatus ?? string.Empty).Trim() switch
        {
            "" or "New" => "Draft",
            "Processing" => "Under review",
            "Not Successful" => "Not successful",
            "Successful" => "Successful",
            _ => "Submitted"
        };

        /// <summary>
        /// UploadDocument does not store a document type and GetAttachedDocuments does not return one,
        /// so the category code is kept as a file-name prefix: "CV__my resume.pdf".
        /// </summary>
        public static string TaggedFileName(string categoryCode, string originalFileName)
        {
            var name = Path.GetFileName(originalFileName ?? string.Empty).Replace(CategorySeparator, "_").Trim();
            var extension = Path.GetExtension(name);
            var stem = Path.GetFileNameWithoutExtension(name);
            if (string.IsNullOrWhiteSpace(stem)) stem = "document";
            // Document Attachment "File Name" is Text[250]; leave room for the prefix.
            if (stem.Length > 180) stem = stem[..180];
            return $"{categoryCode}{CategorySeparator}{stem}{extension}";
        }

        /// <summary>Splits a stored file name back into (category code, display name without extension).</summary>
        public static (string CategoryCode, string DisplayName) ParseFileName(string storedFileName, IEnumerable<DocumentCategory> categories)
        {
            var name = storedFileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? storedFileName[..^4] : storedFileName;
            var index = name.IndexOf(CategorySeparator, StringComparison.Ordinal);
            if (index > 0)
            {
                var code = name[..index];
                if (categories.Any(c => string.Equals(c.Code, code, StringComparison.OrdinalIgnoreCase)))
                    return (code.ToUpperInvariant(), name[(index + CategorySeparator.Length)..]);
            }
            return ("OTHER", name);
        }
    }
}
