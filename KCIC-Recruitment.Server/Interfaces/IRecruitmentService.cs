namespace Recruitment.Server.Interfaces
{
    /// <summary>
    /// Business Central codeunit 70007 "Recruitment" (KCIC HR, Cod70007.HRMPortalRecruitment.al).
    /// One method per AL procedure; see Services/RecruitmentService.cs for the exact SOAP calls.
    /// Phone numbers are AL Integers (see Utilities/BcValue.Phone).
    /// </summary>
    public interface IRecruitmentService
    {
        // ── Accounts (sentinel rows in HRM-Job Applications (B)) ──────────────
        Task CreateOnlineUserAsync(string emailAddress, string firstName, string middleName, string lastName, string idNumber, string hashedPassword);
        Task<string> GetUserPasswordAsync(string username);
        Task<string> UserLoginAsync(string username);
        Task ActivateUserAccountAsync(string email);
        Task UpdateUserPasswordAsync(string username, string newHashedPassword);
        Task<string> GetUserDetailsAsync(string username);
        Task UpdateApplicantProfileAsync(string emailAddress, int initials, int phoneNo, string gender, string maritalStatus,
            string postalCode, string postalAddress, DateTime dateOfBirth, bool disability, string disabilityStatus, string pwdNumber, string country);

        // ── Job adverts ───────────────────────────────────────────────────────
        Task<string> GetAdvertisedJobsAsync();
        Task<string> GetJobRequirementsAsync(string jobId);
        Task<string> GetJobResponsibilitiesAsync(string jobId);
        Task<string> GetKeyCompetenciesAsync(string jobId);
        Task<string> GetJobDescriptionAsync(string requisitionNo);
        Task<string> GetSetupDropDownsAsync(string dropDownType);

        // ── Applications ──────────────────────────────────────────────────────
        Task<string> SubmitJobApplicationAsync(string username, string requisitionNo, string jobId);
        Task<string> GetApplicationsAsync(string username);
        Task<string> GetJobApplicationDetailsAsync(string applicationNo);
        Task<bool> IsApplicationSubmittedAsync(string applicationNo);
        Task SubmitApplicationAsync(string applicationNo);

        Task UpdateApplicationPersonalDetailsAsync(string applicationNo, string salutation, string firstName, string middleName,
            string lastName, string idPassportNo, string email, int phoneNo, int altPhoneNo, DateTime dateOfBirth, string gender,
            string maritalStatus, string country, string countyCode, string postalAddress, string postalCode, bool disability,
            string disabilityType, string pwdNumber, string kraPin, string citizenship, string nationality,
            string altContactPerson, string altContactPhone);
        Task UpdateCurrentEmploymentAsync(string applicationNo, string currentWorkplace, string currentPosition, DateTime effectiveDate, decimal currentMonthlySalary);
        Task UpdateUnemployedDetailsAsync(string applicationNo, bool industrialAttachment, string industrialAttachmentEmployer,
            string industrialAttachmentPeriod, bool internshipTaken, string internshipEmployer, string internshipPeriod, decimal desiredSalary);
        Task UpdateCurrentDutiesAsync(string applicationNo, string currentDuties);
        Task UpdateAbilitiesAndSkillsAsync(string applicationNo, string abilitiesAndSkills);
        Task UpdateOtherDetailsAsync(string applicationNo, Models.OtherDetails details);

        // ── Academic qualifications and professional training ─────────────────
        Task AddAcademicQualificationAsync(string applicationNo, string areaOfStudy, string course, string institution,
            DateTime startDate, DateTime endDate, string grade, DateTime expiry, string courseDescription);
        Task<string> GetAcademicQualificationsAsync(string applicationNo);
        Task<bool> DeleteAcademicQualificationAsync(string applicationNo, int lineNo);

        Task InsertProfessionalQualificationAsync(string applicationNo, string description, string institution, int year,
            string professionalMembership, string trainingDescription);
        Task<string> GetProfessionalQualificationsAsync(string applicationNo);
        Task<bool> DeleteProfessionalQualificationAsync(string applicationNo, int lineNo);

        // ── Work experience ───────────────────────────────────────────────────
        Task InsertWorkExperienceAsync(string applicationNo, string position, string institution, DateTime startDate,
            DateTime endDate, string responsibility, bool isCurrent, decimal salary);
        Task<string> GetWorkExperienceAsync(string applicationNo);
        Task RemoveWorkExperienceAsync(int lineNo, string applicationNo);

        // ── Next of kin and referees ──────────────────────────────────────────
        Task InsertRelationshipsAsync(string relType, string applicationNo, string firstName, string middleName, string lastName,
            int phoneNo, string email, string relationship, string institution);
        Task<string> GetRelationshipsAsync(string applicationNo);
        Task RemoveRelationshipAsync(string id);
        Task InsertApplicationRefereeAsync(string applicationNo, string firstName, string middleName, string lastName, int phoneNo,
            string email, string institution, string address, string periodKnown, string occupation);
        Task<string> GetListofApplicationRefereesAsync(string applicationNo);

        // ── Documents ─────────────────────────────────────────────────────────
        Task UploadDocumentAsync(string applicationNo, string fileName, string attachmentBase64, int tableId, int docType);
        Task<string> GetAttachedDocumentsAsync(string applicationNo);
        Task RemoveDocumentAsync(string id);
    }
}
