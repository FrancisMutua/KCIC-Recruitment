using Recruitment.Server.Interfaces;
using Recruitment.Server.Models;
using static Recruitment.Server.Utilities.BcValue;

namespace Recruitment.Server.Services
{
    /// <summary>
    /// Typed wrapper over Business Central codeunit 70007 "Recruitment" (KCIC HR).
    /// Every method maps 1:1 to a procedure in Cod70007.HRMPortalRecruitment.al. SOAP parameter
    /// names are the AL parameter names, and text is cut to the AL Text[n]/Code[n] lengths so BC
    /// never rejects a value for being too long. Do not call procedures that are not in that codeunit.
    /// </summary>
    public class RecruitmentService(BusinessCentralSoapClient bc) : IRecruitmentService
    {
        private readonly BusinessCentralSoapClient _bc = bc;

        // ── Accounts ───────────────────────────────────────────────────────────
        public Task CreateOnlineUserAsync(string emailAddress, string firstName, string middleName, string lastName, string idNumber, string hashedPassword) =>
            _bc.InvokeAsync("CreateOnlineUser", ("emailAddress", Text(emailAddress, 80)), ("firstName", Text(firstName, 100)),
                ("middleName", Text(middleName, 50)), ("lastName", Text(lastName, 50)), ("idNumber", Text(idNumber, 30)),
                ("hashedPassword", Text(hashedPassword, 250)));

        public Task<string> GetUserPasswordAsync(string username) => _bc.InvokeAsync("GetUserPassword", ("username", Text(username, 80)));
        public Task<string> UserLoginAsync(string username) => _bc.InvokeAsync("UserLogin", ("username", Text(username, 80)));
        public Task ActivateUserAccountAsync(string email) => _bc.InvokeAsync("ActivateUserAccount", ("email", Text(email, 80)));
        public Task UpdateUserPasswordAsync(string username, string newHashedPassword) =>
            _bc.InvokeAsync("UpdateUserPassword", ("username", Text(username, 80)), ("newHashedPassword", Text(newHashedPassword, 250)));
        public Task<string> GetUserDetailsAsync(string username) => _bc.InvokeAsync("GetUserDetails", ("username", Text(username, 80)));

        public Task UpdateApplicantProfileAsync(string emailAddress, int initials, int phoneNo, string gender, string maritalStatus,
            string postalCode, string postalAddress, DateTime dateOfBirth, bool disability, string disabilityStatus, string pwdNumber, string country) =>
            _bc.InvokeAsync("UpdateApplicantProfile", ("emailAddress", Text(emailAddress, 80)), ("initials", initials), ("phoneNo", phoneNo),
                ("gender", Text(gender, 10)), ("maritalStatus", Text(maritalStatus, 10)), ("postalCode", Code(postalCode, 20)),
                ("postalAddress", Text(postalAddress, 80)), ("dateOfBirth", dateOfBirth), ("disability", disability),
                ("disabilityStatus", Text(disabilityStatus, 250)), ("pwdNumber", Text(pwdNumber, 250)), ("country", Code(country, 10)));

        // ── Job adverts ────────────────────────────────────────────────────────
        public Task<string> GetAdvertisedJobsAsync() => _bc.InvokeAsync("GetAdvertisedJobs");
        public Task<string> GetJobRequirementsAsync(string jobId) => _bc.InvokeAsync("GetJobRequirements", ("jobId", Code(jobId, 20)));
        public Task<string> GetJobResponsibilitiesAsync(string jobId) => _bc.InvokeAsync("GetJobResponsibilities", ("jobId", Code(jobId, 20)));
        public Task<string> GetKeyCompetenciesAsync(string jobId) => _bc.InvokeAsync("GetKeyCompetencies", ("jobId", Code(jobId, 20)));
        public Task<string> GetJobDescriptionAsync(string requisitionNo) => _bc.InvokeAsync("GetJobDescription", ("requisitionNo", Code(requisitionNo, 20)));
        public Task<string> GetSetupDropDownsAsync(string dropDownType) => _bc.InvokeAsync("GetSetupDropDowns", ("dropDownType", Text(dropDownType, 50)));

        // ── Applications ───────────────────────────────────────────────────────
        public Task<string> SubmitJobApplicationAsync(string username, string requisitionNo, string jobId) =>
            _bc.InvokeAsync("SubmitJobApplication", ("username", Text(username, 80)), ("requisitionNo", Code(requisitionNo, 20)), ("jobId", Code(jobId, 20)));
        public Task<string> GetApplicationsAsync(string username) => _bc.InvokeAsync("GetApplications", ("username", Text(username, 80)));
        public Task<string> GetJobApplicationDetailsAsync(string applicationNo) =>
            _bc.InvokeAsync("GetJobApplicationDetails", ("applicationNo", Code(applicationNo, 20)));
        public Task<bool> IsApplicationSubmittedAsync(string applicationNo) =>
            _bc.InvokeBoolAsync("IsApplicationSubmitted", ("applicationNo", Code(applicationNo, 20)));
        public Task SubmitApplicationAsync(string applicationNo) => _bc.InvokeAsync("SubmitApplication", ("applicationNo", Code(applicationNo, 20)));

        public Task UpdateApplicationPersonalDetailsAsync(string applicationNo, string salutation, string firstName, string middleName,
            string lastName, string idPassportNo, string email, int phoneNo, int altPhoneNo, DateTime dateOfBirth, string gender,
            string maritalStatus, string country, string countyCode, string postalAddress, string postalCode, bool disability,
            string disabilityType, string pwdNumber, string kraPin, string citizenship, string nationality,
            string altContactPerson, string altContactPhone) =>
            _bc.InvokeAsync("UpdateApplicationPersonalDetails",
                ("applicationNo", Code(applicationNo, 20)), ("salutation", Text(salutation, 30)), ("firstName", Text(firstName, 100)),
                ("middleName", Text(middleName, 50)), ("lastName", Text(lastName, 50)), ("idPassportNo", Text(idPassportNo, 30)),
                ("email", Text(email, 80)), ("phoneNo", phoneNo), ("altPhoneNo", altPhoneNo), ("dateOfBirth", dateOfBirth),
                ("gender", Text(gender, 10)), ("maritalStatus", Text(maritalStatus, 10)), ("country", Code(country, 10)),
                ("countyCode", Code(countyCode, 100)),
                // Accepted by the codeunit but not stored.
                ("subCountyCode", string.Empty), ("wardCode", string.Empty),
                ("postalAddress", Text(postalAddress, 80)), ("postalCode", Code(postalCode, 20)), ("disability", disability),
                ("disabilityType", Text(disabilityType, 250)), ("pwdNumber", Text(pwdNumber, 250)), ("kraPin", Code(kraPin, 20)),
                ("citizenship", Code(citizenship, 10)), ("nationality", Text(nationality, 60)),
                ("altContactPerson", Text(altContactPerson, 100)), ("altContactPhone", Text(altContactPhone, 30)));

        public Task UpdateCurrentEmploymentAsync(string applicationNo, string currentWorkplace, string currentPosition, DateTime effectiveDate, decimal currentMonthlySalary) =>
            _bc.InvokeAsync("UpdateCurrentEmployment", ("applicationNo", Code(applicationNo, 20)), ("currentWorkplace", Text(currentWorkplace, 250)),
                ("currentPosition", Text(currentPosition, 250)), ("effectiveDate", effectiveDate), ("currentMonthlySalary", currentMonthlySalary));

        public Task UpdateUnemployedDetailsAsync(string applicationNo, bool industrialAttachment, string industrialAttachmentEmployer,
            string industrialAttachmentPeriod, bool internshipTaken, string internshipEmployer, string internshipPeriod, decimal desiredSalary) =>
            _bc.InvokeAsync("UpdateUnemployedDetails", ("applicationNo", Code(applicationNo, 20)), ("industrialAttachment", industrialAttachment),
                ("industrialAttachmentEmployer", Text(industrialAttachmentEmployer, 100)), ("industrialAttachmentPeriod", Text(industrialAttachmentPeriod, 50)),
                ("internshipTaken", internshipTaken), ("internshipEmployer", Text(internshipEmployer, 100)),
                ("internshipPeriod", Text(internshipPeriod, 50)), ("desiredSalary", desiredSalary));

        public Task UpdateCurrentDutiesAsync(string applicationNo, string currentDuties) =>
            _bc.InvokeAsync("UpdateCurrentDuties", ("applicationNo", Code(applicationNo, 20)), ("currentDuties", Text(currentDuties, 2048)));

        public Task UpdateAbilitiesAndSkillsAsync(string applicationNo, string abilitiesAndSkills) =>
            _bc.InvokeAsync("UpdateAbilitiesAndSkills", ("applicationNo", Code(applicationNo, 20)), ("abilitiesAndSkills", Text(abilitiesAndSkills, 2048)));

        public Task UpdateOtherDetailsAsync(string applicationNo, OtherDetails d) =>
            _bc.InvokeAsync("UpdateOtherDetails",
                ("applicationNo", Code(applicationNo, 20)),
                ("languagesProficientIn", Text(d.LanguagesProficientIn, 500)),
                ("disabled", d.Disabled), ("disabilityType", Text(d.DisabilityType, 250)), ("pwdNumber", Text(d.PwdNumber, 250)),
                ("interviewedAtKCIC", d.InterviewedAtKCIC), ("kcicPositionApplied", Text(d.KCICPositionApplied, 100)),
                ("kcicInterviewDate", Date(d.KCICInterviewDate)),
                ("relativeAtKCIC", d.RelativeAtKCIC), ("relativeAtKCICDetails", Text(d.RelativeAtKCICDetails, 250)),
                ("conflictOfInterest", d.ConflictOfInterest), ("conflictOfInterestDetails", Text(d.ConflictOfInterestDetails, 250)),
                ("dismissedFromEmployment", d.DismissedFromEmployment), ("dismissalReason", Text(d.DismissalReason, 250)),
                ("dismissalDate", Date(d.DismissalDate)),
                ("litigationLast3Years", d.LitigationLast3Years), ("litigationDetails", Text(d.LitigationDetails, 250)),
                ("convictedLast3Years", d.ConvictedLast3Years), ("convictionDetails", Text(d.ConvictionDetails, 250)),
                ("accFraudBriberyCorruption", d.AccFraudBriberyCorruption), ("accSlaveryTrafficking", d.AccSlaveryTrafficking),
                ("accMoneyLaundering", d.AccMoneyLaundering), ("accTerrorism", d.AccTerrorism),
                ("accChildVulnerableRights", d.AccChildVulnerableRights), ("accSexualHarassment", d.AccSexualHarassment));

        // ── Academic qualifications and professional training ──────────────────
        public Task AddAcademicQualificationAsync(string applicationNo, string areaOfStudy, string course, string institution,
            DateTime startDate, DateTime endDate, string grade, DateTime expiry, string courseDescription) =>
            _bc.InvokeAsync("AddAcademicQualification", ("applicationNo", Code(applicationNo, 20)), ("areaOfStudy", Text(areaOfStudy, 100)),
                ("course", Text(course, 100)), ("institution", Text(institution, 100)), ("startDate", startDate), ("endDate", endDate),
                ("grade", Text(grade, 30)), ("expiry", expiry), ("courseDescription", Text(courseDescription, 250)));
        public Task<string> GetAcademicQualificationsAsync(string applicationNo) =>
            _bc.InvokeAsync("GetAcademicQualifications", ("applicationNo", Code(applicationNo, 20)));
        public Task<bool> DeleteAcademicQualificationAsync(string applicationNo, int lineNo) =>
            _bc.InvokeBoolAsync("DeleteAcademicQualification", ("applicationNo", Code(applicationNo, 20)), ("lineNo", lineNo));

        public Task InsertProfessionalQualificationAsync(string applicationNo, string description, string institution, int year,
            string professionalMembership, string trainingDescription) =>
            _bc.InvokeAsync("InsertProfessionalQualification", ("applicationNo", Code(applicationNo, 20)), ("description", Text(description, 250)),
                ("institution", Text(institution, 100)), ("year", year), ("professionalMembership", Text(professionalMembership, 100)),
                ("trainingDescription", Text(trainingDescription, 250)));
        public Task<string> GetProfessionalQualificationsAsync(string applicationNo) =>
            _bc.InvokeAsync("GetProfessionalQualifications", ("applicationNo", Code(applicationNo, 20)));
        public Task<bool> DeleteProfessionalQualificationAsync(string applicationNo, int lineNo) =>
            _bc.InvokeBoolAsync("DeleteProfessionalQualification", ("applicationNo", Code(applicationNo, 20)), ("lineNo", lineNo));

        // ── Work experience ────────────────────────────────────────────────────
        public Task InsertWorkExperienceAsync(string applicationNo, string position, string institution, DateTime startDate,
            DateTime endDate, string responsibility, bool isCurrent, decimal salary) =>
            _bc.InvokeAsync("InsertWorkExperience", ("applicationNo", Code(applicationNo, 20)), ("position", Text(position, 250)),
                ("institution", Text(institution, 150)), ("startDate", startDate), ("endDate", endDate),
                ("responsibility", Text(responsibility, 500)), ("isCurrent", isCurrent), ("salary", salary));
        public Task<string> GetWorkExperienceAsync(string applicationNo) => _bc.InvokeAsync("GetWorkExperience", ("applicationNo", Code(applicationNo, 20)));
        public Task RemoveWorkExperienceAsync(int lineNo, string applicationNo) =>
            _bc.InvokeAsync("RemoveWorkExperience", ("lineNo", lineNo), ("applicationNo", Code(applicationNo, 20)));

        // ── Next of kin and referees ───────────────────────────────────────────
        public Task InsertRelationshipsAsync(string relType, string applicationNo, string firstName, string middleName, string lastName,
            int phoneNo, string email, string relationship, string institution) =>
            _bc.InvokeAsync("InsertRelationships", ("relType", Text(relType, 50)), ("applicationNo", Code(applicationNo, 20)),
                ("firstName", Text(firstName, 100)), ("middleName", Text(middleName, 50)), ("lastName", Text(lastName, 50)),
                ("phoneNo", phoneNo), ("email", Text(email, 100)), ("relationship", Text(relationship, 100)), ("institution", Text(institution, 100)));
        public Task<string> GetRelationshipsAsync(string applicationNo) => _bc.InvokeAsync("GetRelationships", ("applicationNo", Code(applicationNo, 20)));
        public Task RemoveRelationshipAsync(string id) => _bc.InvokeAsync("RemoveRelationship", ("id", Text(id, 100)));

        public Task InsertApplicationRefereeAsync(string applicationNo, string firstName, string middleName, string lastName, int phoneNo,
            string email, string institution, string address, string periodKnown, string occupation) =>
            _bc.InvokeAsync("InsertApplicationReferee", ("applicationNo", Code(applicationNo, 20)), ("firstName", Text(firstName, 100)),
                ("middleName", Text(middleName, 50)), ("lastName", Text(lastName, 50)), ("phoneNo", phoneNo), ("email", Text(email, 100)),
                ("institution", Text(institution, 100)), ("address", Text(address, 200)), ("periodKnown", Text(periodKnown, 30)),
                ("occupation", Text(occupation, 100)));
        public Task<string> GetListofApplicationRefereesAsync(string applicationNo) =>
            _bc.InvokeAsync("GetListofApplicationReferees", ("applicationNo", Code(applicationNo, 20)));

        // ── Documents ──────────────────────────────────────────────────────────
        public Task UploadDocumentAsync(string applicationNo, string fileName, string attachmentBase64, int tableId, int docType) =>
            _bc.InvokeAsync("UploadDocument", ("applicationNo", Code(applicationNo, 20)), ("fileName", Text(fileName, 250)),
                ("attachment", attachmentBase64), ("tableId", tableId), ("docType", docType));
        public Task<string> GetAttachedDocumentsAsync(string applicationNo) =>
            _bc.InvokeAsync("GetAttachedDocuments", ("applicationNo", Code(applicationNo, 20)));
        public Task RemoveDocumentAsync(string id) => _bc.InvokeAsync("RemoveDocument", ("id", Text(id, 50)));
    }
}
