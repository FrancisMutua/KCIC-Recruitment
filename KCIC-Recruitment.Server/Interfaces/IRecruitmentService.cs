namespace Recruitment.Server.Interfaces
{
    /// <summary>Business Central codeunit 50034 "Recruitment" (see Services/RecruitmentService.cs).</summary>
    public interface IRecruitmentService
    {
        Task CreateOnlineUserAsync(string emailAddress, string firstName, string middleName, string lastName, string idNumber, string password);
        Task<string> UserLoginAsync(string email);
        Task ActivateUserAccountAsync(string email);
        Task UpdateUserPasswordAsync(string email, string newPassword);
        Task<string> GetUserPasswordAsync(string email);
        Task<string> GetUserDetailsAsync(string username);
        Task UpdateApplicantProfileAsync(string emailAddress, string initials, string phoneNumber, int gender, int maritalStatus,
            string postalCode, string postalAddress, DateTime birthDate, bool disability, string disabilityStatus, string pwdNumber, string country);

        Task<string> GetAdvertisedJobsAsync();
        Task<string> GetJobTitleAsync(string jobId);
        Task<string> GetJobPurposeAsync(string jobId);
        Task<string> GetJobRequirementsAsync(string jobId);
        Task<string> GetJobResponsibilitiesAsync(string jobId);
        Task<string> GetMinimumRequirementsAsync(string jobId);
        Task<string> GetSetupDropDownsAsync(string dropdownType, string filters);
        Task<string> GetDisabilityTypesAsync();

        Task<string> SubmitJobApplicationAsync(string username, string requisitionNo, string jobId);
        Task<string> GetApplicationsAsync(string username);
        Task<string> GetJobApplicationDetailsAsync(string applicationNo);
        Task<bool> IsApplicationSubmittedAsync(string applicationNo);
        Task SubmitApplicationAsync(string documentNo);
        Task<string> GetApplicationStatisticsAsync(string email);
        Task<bool> UpdateApplicationPersonalDetailsAsync(string applicationNo, string salutation, string firstName, string middleName,
            string lastName, string idPassportNo, string email, string phoneNo, string altPhoneNo, DateTime dateOfBirth, int gender,
            int maritalStatus, string country, string countyCode, string postalAddress, string postalCode, bool disability,
            string disabilityType, string pwdNumber, string kraPin, string citizenship);

        Task<string> GetAcademicQualificationsAsync(string applicationNo);
        Task<string> GetAcademicQualificationDetailsAsync(string applicationNo);
        Task<bool> AddAcademicQualificationAsync(string applicationNo, string areaOfStudy, string course, string institution,
            DateTime startDate, DateTime endDate, string grade, DateTime expiry, string courseDescription);
        Task RemoveAcademicQualificationAsync(string id);

        Task<string> GetWorkExperienceAsync(string applicationNo);
        Task InsertWorkExperienceAsync(string applicationNo, string position, string institution, DateTime startDate,
            DateTime endDate, string responsibilities, bool isCurrentPosition);

        Task<string> GetProfessionalQualificationsAsync(string applicationNo);
        Task InsertProfessionalQualificationAsync(string applicationNo, string description, string institution, int year);
        Task<string> GetProfessionalMembershipsAsync(string applicationNo);
        Task InsertProfessionalMembershipAsync(string applicationNo, string bodyName, string membershipNo, DateTime membershipDate, int statusValue);

        Task<string> GetRelationshipsAsync(string applicationNo);
        Task<string> GetListofApplicationRefereesAsync(string applicationNo);
        Task InsertRelationshipsAsync(string type, string applicationNo, string firstName, string middleName, string lastName,
            string phoneNo, string email, string relationship, string institution);
        Task RemoveRelationshipAsync(string id);

        Task UploadDocumentAsync(string retNo, string fileName, string attachmentBase64, int docType);
        Task<string> GetAttachedDocumentsAsync(string documentNo);
        Task RemoveDocumentAsync(string id);
    }
}
