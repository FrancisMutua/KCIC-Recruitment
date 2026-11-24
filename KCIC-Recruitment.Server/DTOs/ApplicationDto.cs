using Recruitment.Server.Models;

namespace Recruitment.Server.DTOs
{
    /// <summary>Section 2 — UpdateApplicationPersonalDetails.</summary>
    public class PersonalDetailsUpdateDto
    {
        public string ApplicationNo { get; set; } = string.Empty;
        public string Salutation { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string MiddleName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string IDPassportNo { get; set; } = string.Empty;
        public string PhoneNo { get; set; } = string.Empty;
        public string AltPhoneNo { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }
        /// <summary>"Male" or "Female" (the codeunit maps the text to the BC option).</summary>
        public string Gender { get; set; } = string.Empty;
        /// <summary>Single, Married, Divorced, Widow, Widower or Complicated (codeunit MapMaritalStatusFromPortal).</summary>
        public string MaritalStatus { get; set; } = string.Empty;
        public string Nationality { get; set; } = string.Empty;
        public string Citizenship { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string CountyCode { get; set; } = string.Empty;
        public string PostalAddress { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        public bool Disability { get; set; }
        public string DisabilityType { get; set; } = string.Empty;
        public string PWDNumber { get; set; } = string.Empty;
        public string KRAPin { get; set; } = string.Empty;
        public string AltContactPerson { get; set; } = string.Empty;
        public string AltContactPhone { get; set; } = string.Empty;
    }

    /// <summary>Sections 3 and 4 — current employment and unemployed applicants.</summary>
    public class EmploymentUpdateDto
    {
        public string ApplicationNo { get; set; } = string.Empty;
        public string CurrentWorkplace { get; set; } = string.Empty;
        public string CurrentPosition { get; set; } = string.Empty;
        public DateTime? EffectiveDate { get; set; }
        public decimal CurrentMonthlySalary { get; set; }
        public bool IndustrialAttachment { get; set; }
        public string IndustrialAttachmentEmployer { get; set; } = string.Empty;
        public string IndustrialAttachmentPeriod { get; set; } = string.Empty;
        public bool InternshipTaken { get; set; }
        public string InternshipEmployer { get; set; } = string.Empty;
        public string InternshipPeriod { get; set; } = string.Empty;
        public decimal DesiredSalary { get; set; }
    }

    /// <summary>Sections 9 and 10 — current duties; abilities, skills and experience.</summary>
    public class DutiesAbilitiesUpdateDto
    {
        public string ApplicationNo { get; set; } = string.Empty;
        public string CurrentDuties { get; set; } = string.Empty;
        public string AbilitiesAndSkills { get; set; } = string.Empty;
    }

    /// <summary>Section 5 (a–i) — languages, physical impairment and declarations.</summary>
    public class OtherDetailsUpdateDto : OtherDetails
    {
        public string ApplicationNo { get; set; } = string.Empty;
    }

    /// <summary>Section 6 — AddAcademicQualification.</summary>
    public class AddAcademicQualificationDto
    {
        public string ApplicationNo { get; set; } = string.Empty;
        /// <summary>Degree, Diploma, Certificate or Other (sets "Qualification Attained" in BC).</summary>
        public string Level { get; set; } = string.Empty;
        /// <summary>Course / specialisation, stored as "Subject/Specialization".</summary>
        public string AreaOfStudy { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Grade { get; set; } = string.Empty;
        public string CourseDescription { get; set; } = string.Empty;
    }

    /// <summary>Section 7 — InsertProfessionalQualification.</summary>
    public class AddProfessionalTrainingDto
    {
        public string ApplicationNo { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
        public int Year { get; set; }
        public string ProfessionalMembership { get; set; } = string.Empty;
        public string TrainingDescription { get; set; } = string.Empty;
    }

    /// <summary>Section 8 — InsertWorkExperience.</summary>
    public class AddWorkExperienceDto
    {
        public string ApplicationNo { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsCurrent { get; set; }
        public string Responsibility { get; set; } = string.Empty;
        public decimal Salary { get; set; }
    }

    /// <summary>Next of kin — InsertRelationships.</summary>
    public class AddNextOfKinDto
    {
        public string ApplicationNo { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string MiddleName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string PhoneNo { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Relationship { get; set; } = string.Empty;
        /// <summary>Occupation / employer, stored in "Occupation".</summary>
        public string Institution { get; set; } = string.Empty;
    }

    /// <summary>Section 11 — InsertApplicationReferee.</summary>
    public class AddRefereeDto
    {
        public string ApplicationNo { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string MiddleName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string PhoneNo { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string PeriodKnown { get; set; } = string.Empty;
        public string Occupation { get; set; } = string.Empty;
    }

    public class AttachmentDto
    {
        public string Id { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string FileExtension { get; set; } = string.Empty;
        public string RequirementCode { get; set; } = string.Empty;
        public string DocumentType { get; set; } = string.Empty;
        public string DocumentDate { get; set; } = string.Empty;
    }

    public class UploadAttachmentDto
    {
        public string ApplicationNo { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string Attachment { get; set; } = string.Empty; // Base64
        public string RequirementCode { get; set; } = string.Empty;
    }
}
