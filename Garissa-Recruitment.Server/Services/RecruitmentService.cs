using Recruitment.Server.Interfaces;

namespace Recruitment.Server.Services
{
    /// <summary>
    /// Typed wrapper over Business Central codeunit 50034 "Recruitment" (Garissa).
    /// Every method maps 1:1 to a procedure in Cod50034.RecruitmentPortal.al; parameter
    /// names and types follow the AL signature exactly. Do not add calls to procedures
    /// that do not exist in that codeunit.
    /// </summary>
    public class RecruitmentService(BusinessCentralSoapClient bc) : IRecruitmentService
    {
        private readonly BusinessCentralSoapClient _bc = bc;

        // AL Code[n] parameters reject longer values, so trim before sending.
        private static string Code(string? value, int length)
        {
            var text = (value ?? string.Empty).Trim();
            return text.Length > length ? text[..length] : text;
        }

        // ── Accounts ───────────────────────────────────────────────────────────
        public Task CreateOnlineUserAsync(string emailAddress, string firstName, string middleName, string lastName, string idNumber, string password) =>
            _bc.InvokeAsync("CreateOnlineUser", ("emailAddress", emailAddress), ("firstName", firstName), ("middleName", middleName),
                ("lastName", lastName), ("idNumber", idNumber), ("password", password));

        public Task<string> UserLoginAsync(string email) => _bc.InvokeAsync("UserLogin", ("email", email));
        public Task ActivateUserAccountAsync(string email) => _bc.InvokeAsync("ActivateUserAccount", ("email", email));
        public Task UpdateUserPasswordAsync(string email, string newPassword) =>
            _bc.InvokeAsync("UpdateUserPassword", ("email", email), ("newPassword", newPassword));
        public Task<string> GetUserPasswordAsync(string email) => _bc.InvokeAsync("GetUserPassword", ("email", email));
        public Task<string> GetUserDetailsAsync(string username) => _bc.InvokeAsync("GetUserDetails", ("username", username));

        public Task UpdateApplicantProfileAsync(string emailAddress, string initials, string phoneNumber, int gender, int maritalStatus,
            string postalCode, string postalAddress, DateTime birthDate, bool disability, string disabilityStatus, string pwdNumber, string country) =>
            _bc.InvokeAsync("UpdateApplicantProfile", ("emailAddress", emailAddress), ("initials", initials), ("phoneNumber", phoneNumber),
                ("gender", gender), ("maritalStatus", maritalStatus), ("postalCode", postalCode), ("postalAddress", postalAddress),
                ("birthDate", birthDate), ("disability", disability), ("disabilityStatus", disabilityStatus), ("pwdNumber", pwdNumber),
                ("country", country));

        // ── Adverts ────────────────────────────────────────────────────────────
        public Task<string> GetAdvertisedJobsAsync() => _bc.InvokeAsync("GetAdvertisedJobs");
        public Task<string> GetJobTitleAsync(string jobId) => _bc.InvokeAsync("GetJobTitle", ("jobId", jobId));
        public Task<string> GetJobPurposeAsync(string jobId) => _bc.InvokeAsync("GetJobPurpose", ("jobId", jobId));
        public Task<string> GetJobRequirementsAsync(string jobId) => _bc.InvokeAsync("GetJobRequirements", ("jobId", jobId));
        public Task<string> GetJobResponsibilitiesAsync(string jobId) => _bc.InvokeAsync("GetJobResponsibilities", ("jobId", jobId));
        public Task<string> GetMinimumRequirementsAsync(string jobId) => _bc.InvokeAsync("GetMinimumRequirements", ("jobId", jobId));
        public Task<string> GetSetupDropDownsAsync(string dropdownType, string filters) =>
            _bc.InvokeAsync("GetSetupDropDowns", ("dropdownType", dropdownType), ("filters", filters));
        public Task<string> GetDisabilityTypesAsync() => _bc.InvokeAsync("GetDisabilityTypes");

        // ── Applications ───────────────────────────────────────────────────────
        public Task<string> SubmitJobApplicationAsync(string username, string requisitionNo, string jobId) =>
            _bc.InvokeAsync("SubmitJobApplication", ("username", username), ("requisitionNo", requisitionNo), ("jobId", jobId));
        public Task<string> GetApplicationsAsync(string username) => _bc.InvokeAsync("GetApplications", ("username", username));
        public Task<string> GetJobApplicationDetailsAsync(string applicationNo) =>
            _bc.InvokeAsync("GetJobApplicationDetails", ("applicationNo", applicationNo));
        public Task<bool> IsApplicationSubmittedAsync(string applicationNo) =>
            _bc.InvokeBoolAsync("IsApplicationSubmitted", ("applicationNo", applicationNo));
        public Task SubmitApplicationAsync(string documentNo) => _bc.InvokeAsync("SubmitApplication", ("documentNo", documentNo));
        public Task<string> GetApplicationStatisticsAsync(string email) => _bc.InvokeAsync("GetApplicationStatistics", ("email", email));

        public Task<bool> UpdateApplicationPersonalDetailsAsync(string applicationNo, string salutation, string firstName, string middleName,
            string lastName, string idPassportNo, string email, string phoneNo, string altPhoneNo, DateTime dateOfBirth, int gender,
            int maritalStatus, string country, string countyCode, string postalAddress, string postalCode, bool disability,
            string disabilityType, string pwdNumber, string kraPin, string citizenship) =>
            _bc.InvokeBoolAsync("UpdateApplicationPersonalDetails",
                ("applicationNo", Code(applicationNo, 20)), ("salutation", salutation), ("firstName", firstName),
                ("middleName", middleName), ("lastName", lastName), ("iDPassportNo", Code(idPassportNo, 20)), ("email", email),
                ("phoneNo", phoneNo), ("altPhoneNo", altPhoneNo), ("dateOfBirth", dateOfBirth), ("gender", gender),
                ("maritalStatus", maritalStatus), ("country", Code(country, 20)), ("countyCode", Code(countyCode, 20)),
                // Sub-county and ward are accepted by BC but not stored.
                ("subCountyCode", string.Empty), ("wardCode", string.Empty),
                ("postalAddress", postalAddress), ("postalCode", Code(postalCode, 20)), ("disability", disability),
                ("disabilityType", Code(disabilityType, 20)), ("pWDNumber", Code(pwdNumber, 20)), ("kRAPin", Code(kraPin, 20)),
                ("citizenship", Code(citizenship, 20)));

        // ── Academic qualifications ────────────────────────────────────────────
        public Task<string> GetAcademicQualificationsAsync(string applicationNo) =>
            _bc.InvokeAsync("GetAcademicQualifications", ("applicationNo", applicationNo));
        public Task<string> GetAcademicQualificationDetailsAsync(string applicationNo) =>
            _bc.InvokeAsync("GetAcademicQualificationDetails", ("applicationNo", applicationNo));
        public Task<bool> AddAcademicQualificationAsync(string applicationNo, string areaOfStudy, string course, string institution,
            DateTime startDate, DateTime endDate, string grade, DateTime expiry, string courseDescription) =>
            _bc.InvokeBoolAsync("AddAcademicQualification", ("applicationNo", applicationNo), ("areaOfStudy", Code(areaOfStudy, 20)),
                ("course", Code(course, 20)), ("institution", institution), ("startDate", startDate), ("endDate", endDate),
                ("grade", grade), ("expiry", expiry), ("courseDescription", courseDescription));
        public Task RemoveAcademicQualificationAsync(string id) => _bc.InvokeAsync("RemoveAcademicQualification", ("id", id));

        // ── Work experience ────────────────────────────────────────────────────
        public Task<string> GetWorkExperienceAsync(string applicationNo) => _bc.InvokeAsync("GetWorkExperience", ("applicationNo", applicationNo));
        public Task InsertWorkExperienceAsync(string applicationNo, string position, string institution, DateTime startDate,
            DateTime endDate, string responsibilities, bool isCurrentPosition) =>
            _bc.InvokeAsync("InsertWorkExperience", ("applicationNo", applicationNo), ("position", position), ("institution", institution),
                ("startDate", startDate), ("endDate", endDate), ("responsibilities", responsibilities), ("isCurrentPosition", isCurrentPosition));

        // ── Professional qualifications & memberships ──────────────────────────
        public Task<string> GetProfessionalQualificationsAsync(string applicationNo) =>
            _bc.InvokeAsync("GetProfessionalQualifications", ("applicationNo", Code(applicationNo, 20)));
        public Task InsertProfessionalQualificationAsync(string applicationNo, string description, string institution, int year) =>
            _bc.InvokeAsync("InsertProfessionalQualification", ("applicationNo", Code(applicationNo, 20)),
                ("professionalQualificationDescription", description), ("institution", institution), ("year", year),
                ("professionalMembership", string.Empty), ("trainingDescription", string.Empty));

        public Task<string> GetProfessionalMembershipsAsync(string applicationNo) =>
            _bc.InvokeAsync("GetProfessionalMemberships", ("applicationNo", Code(applicationNo, 20)));
        public Task InsertProfessionalMembershipAsync(string applicationNo, string bodyName, string membershipNo, DateTime membershipDate, int statusValue) =>
            _bc.InvokeAsync("InsertProfessionalMembership", ("applicationNo", Code(applicationNo, 20)), ("bodyCode", Code(bodyName, 20)),
                ("bodyName", bodyName), ("membershipNo", membershipNo), ("membershipDate", membershipDate), ("statusValue", statusValue),
                ("remarks", string.Empty));

        // ── Referees / next of kin (HRM-Applicant Referees) ────────────────────
        public Task<string> GetRelationshipsAsync(string applicationNo) => _bc.InvokeAsync("GetRelationships", ("applicationNo", applicationNo));
        public Task<string> GetListofApplicationRefereesAsync(string applicationNo) =>
            _bc.InvokeAsync("GetListofApplicationReferees", ("applicationNo", applicationNo));
        public Task InsertRelationshipsAsync(string type, string applicationNo, string firstName, string middleName, string lastName,
            string phoneNo, string email, string relationship, string institution) =>
            // "relatioship" is spelt this way in the AL signature.
            _bc.InvokeAsync("InsertRelationships", ("type", type), ("applicationNo", applicationNo), ("firstName", firstName),
                ("middleName", middleName), ("lastName", lastName), ("phoneNo", phoneNo), ("email", email),
                ("relatioship", relationship), ("institution", institution));
        public Task RemoveRelationshipAsync(string id) => _bc.InvokeAsync("RemoveRelationship", ("id", id));

        // ── Documents ──────────────────────────────────────────────────────────
        public Task UploadDocumentAsync(string retNo, string fileName, string attachmentBase64, int docType) =>
            _bc.InvokeAsync("UploadDocument", ("retNo", Code(retNo, 50)), ("fileName", fileName), ("attachment", attachmentBase64), ("docType", docType));
        public Task<string> GetAttachedDocumentsAsync(string documentNo) => _bc.InvokeAsync("GetAttachedDocuments", ("documentNo", documentNo));
        public Task RemoveDocumentAsync(string id) => _bc.InvokeAsync("RemoveDocument", ("id", id));
    }
}
