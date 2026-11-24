namespace Recruitment.Server.Models
{
    /// <summary>
    /// Portal-side recruitment rules ("Recruitment" section of appsettings.json).
    /// Business Central codeunit 70007 has no setup for these, so the portal enforces them.
    /// </summary>
    public class RecruitmentOptions
    {
        public int MinimumReferees { get; set; } = 3;
        public int MinimumNextOfKin { get; set; } = 0;
        public int MinimumAcademicQualifications { get; set; } = 1;
        public List<DocumentCategory> DocumentCategories { get; set; } = [];
    }

    public class DocumentCategory
    {
        /// <summary>Short code stored as the attachment file-name prefix, e.g. "CV".</summary>
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool Required { get; set; }
    }
}
