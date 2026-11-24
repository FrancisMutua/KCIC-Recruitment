using Recruitment.Server.Models;

namespace Recruitment.Server.Services
{
    /// <summary>Portal rules layered on top of codeunit 50034 (status labels, document tagging).</summary>
    public static class ApplicationRules
    {
        private const string CategorySeparator = "__";

        /// <summary>
        /// Applicant-facing status. BC keeps a separate Submitted flag; the Status option
        /// ("Open,Closed,Pending,Rejected,Under Review,Not Successfull,Normal") is HR's progress.
        /// </summary>
        public static string CandidateStatus(bool submitted, string? bcStatus) =>
            !submitted ? "Draft" : (bcStatus ?? string.Empty).Trim() switch
            {
                "Under Review" => "Under review",
                "Rejected" or "Not Successfull" => "Not successful",
                "Closed" => "Closed",
                _ => "Submitted"
            };

        /// <summary>
        /// UploadDocument ignores docType and GetAttachedDocuments does not return it, so the
        /// category code is kept as a file-name prefix: "CV__my resume.pdf".
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

        /// <summary>Splits a stored file name back into (category code, display name).</summary>
        public static (string CategoryCode, string DisplayName) ParseFileName(string storedFileName, IEnumerable<DocumentCategory> categories)
        {
            var index = storedFileName.IndexOf(CategorySeparator, StringComparison.Ordinal);
            if (index > 0)
            {
                var code = storedFileName[..index];
                if (categories.Any(c => string.Equals(c.Code, code, StringComparison.OrdinalIgnoreCase)))
                    return (code.ToUpperInvariant(), storedFileName[(index + CategorySeparator.Length)..]);
            }
            return ("OTHER", storedFileName);
        }
    }
}
