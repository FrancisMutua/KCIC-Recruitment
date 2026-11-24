namespace Recruitment.Server.Models
{
    /// <summary>
    /// Section 5 (a–i) of the KCIC application form, saved by codeunit 70007 UpdateOtherDetails.
    /// 5(b) "physical impairment" is the Disabled / DisabilityType pair.
    /// </summary>
    public class OtherDetails
    {
        public string LanguagesProficientIn { get; set; } = string.Empty;

        public bool Disabled { get; set; }
        public string DisabilityType { get; set; } = string.Empty;
        public string PwdNumber { get; set; } = string.Empty;

        public bool InterviewedAtKCIC { get; set; }
        public string KCICPositionApplied { get; set; } = string.Empty;
        public DateTime? KCICInterviewDate { get; set; }

        public bool RelativeAtKCIC { get; set; }
        public string RelativeAtKCICDetails { get; set; } = string.Empty;

        public bool ConflictOfInterest { get; set; }
        public string ConflictOfInterestDetails { get; set; } = string.Empty;

        public bool DismissedFromEmployment { get; set; }
        public string DismissalReason { get; set; } = string.Empty;
        public DateTime? DismissalDate { get; set; }

        public bool LitigationLast3Years { get; set; }
        public string LitigationDetails { get; set; } = string.Empty;

        public bool ConvictedLast3Years { get; set; }
        public string ConvictionDetails { get; set; } = string.Empty;

        public bool AccFraudBriberyCorruption { get; set; }
        public bool AccSlaveryTrafficking { get; set; }
        public bool AccMoneyLaundering { get; set; }
        public bool AccTerrorism { get; set; }
        public bool AccChildVulnerableRights { get; set; }
        public bool AccSexualHarassment { get; set; }
    }
}
