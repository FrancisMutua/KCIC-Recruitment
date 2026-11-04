using System;

namespace Recruitment.Server.DTOs
{
    public class RecruitmentActionDto
    {
        public string ApplicationNo { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public System.Text.Json.JsonElement Data { get; set; }
    }

    public class PersonalDetailsUpdateDto
    {
        public string ApplicationNo { get; set; } = string.Empty;
        public string Salutation { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string MiddleName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string IDPassportNo { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNo { get; set; } = string.Empty;
        public string AltPhoneNo { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public Models.Enums.EmployeeGender Gender { get; set; }
        public Models.Enums.MaritalStatus MaritalStatus { get; set; }
        public string Country { get; set; } = string.Empty;
        public string CountyCode { get; set; } = string.Empty;
        public string SubCountyCode { get; set; } = string.Empty;
        public string WardCode { get; set; } = string.Empty;
        public string PostalAddress { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        public bool Disability { get; set; }
        public string DisabilityType { get; set; } = string.Empty;
        public string PWDNumber { get; set; } = string.Empty;
        public string KRAPin { get; set; } = string.Empty;
        public string Citizenship { get; set; } = string.Empty;
        public string Ethnicity { get; set; } = string.Empty;
        public decimal CurrentSalary { get; set; }
        public decimal ExpectedSalary { get; set; }
        public string NoticePeriod { get; set; } = string.Empty;
    }

    public class AcademicQualificationDto
    {
        public int LineNo { get; set; }
        public string ApplicationNo { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
        public string StartDate { get; set; } = string.Empty;
        public string EndDate { get; set; } = string.Empty;
        public string CourseDescription  { get; set; } = string.Empty;
        public string AreaOfStudy { get; set; } = string.Empty;
        public string Grade { get; set; } = string.Empty;
        public string Expiry { get; set; } = string.Empty;
    }

    public class AddAcademicQualificationDto
    {
        public string ApplicationNo { get; set; } = string.Empty;
        public string Course { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
        public string CourseDescription { get; set; } = string.Empty;
        public string AreaOfStudy { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Grade { get; set; } = string.Empty;
        public DateTime? Expiry { get; set; }
    }

    public class WorkExperienceDto
    {
        public int LineNo { get; set; }
        public string ApplicationNo { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
        public string StartDate { get; set; } = string.Empty;
        public string EndDate { get; set; } = string.Empty;
    }

    public class AddWorkExperienceDto
    {
        public string ApplicationNo { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public Boolean IsCurrent { get; set; } = false;
        public string Responsibility { get; set; } = string.Empty;
    }

    public class RelationshipDto
    {
        public string ApplicationNo { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string MiddleName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public int PhoneNo { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
        public string Id { get; set; } = string.Empty;
        public string Relationship { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
    }

    public class AddRelationshipDto
    {
        public string Type { get; set; } = string.Empty; // nok, relative, referee
        public string ApplicationNo { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string MiddleName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public int PhoneNo { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Relationship { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
    }

    public class AttachmentDto
    {
        public string DocumentType { get; set; } = string.Empty;
        public string RequirementCode { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string FileExtension { get; set; } = string.Empty;
        public DateTime DocumentDate { get; set; }
        public string Id { get; set; } = string.Empty;
    }

    public class UploadAttachmentDto
    {
        public string ApplicationNo { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string Attachment { get; set; } = string.Empty; // Base64
        public int TableId { get; set; } = 52178435;
        public int DocType { get; set; } // Uses the recruitment document categories.
        public string RequirementCode { get; set; } = string.Empty;
    }

    public class ProfessionalTrainingDto
    {
        public int LineNo { get; set; }
        public string ApplicationNo { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
        public int Year { get; set; }
        public string ProfessionalMembership { get; set; } = string.Empty;
        public string TrainingDescription { get; set; } = string.Empty;
    }

    public class AddProfessionalTrainingDto
    {
        public string ApplicationNo { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
        public int Year { get; set; }
        public string ProfessionalMembership { get; set; } = string.Empty;
        public string TrainingDescription { get; set; } = string.Empty;
    }
}
