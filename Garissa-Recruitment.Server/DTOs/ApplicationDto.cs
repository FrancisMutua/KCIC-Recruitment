namespace Recruitment.Server.DTOs
{
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
        public DateTime DateOfBirth { get; set; }
        /// <summary>BC option index on HRM-Job Applications (B): 1 Male, 2 Female, 3 Other.</summary>
        public int Gender { get; set; }
        /// <summary>BC option index: 1 Single, 2 Married, 3 Separated, 4 Divorced, 5 Widow(er), 6 Other.</summary>
        public int MaritalStatus { get; set; }
        public string Country { get; set; } = string.Empty;
        public string CountyCode { get; set; } = string.Empty;
        public string PostalAddress { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        public bool Disability { get; set; }
        public string DisabilityType { get; set; } = string.Empty;
        public string PWDNumber { get; set; } = string.Empty;
        public string KRAPin { get; set; } = string.Empty;
        public string Citizenship { get; set; } = string.Empty;
    }

    public class AcademicQualificationDto
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationNo { get; set; } = string.Empty;
        /// <summary>Qualification level code (HRM-Qualifications).</summary>
        public string Code { get; set; } = string.Empty;
        /// <summary>Course name.</summary>
        public string Description { get; set; } = string.Empty;
        public string AreaOfStudy { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
        public string StartDate { get; set; } = string.Empty;
        public string EndDate { get; set; } = string.Empty;
        public string Grade { get; set; } = string.Empty;
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
    }

    public class WorkExperienceDto
    {
        public string ApplicationNo { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
        public bool IsCurrentPosition { get; set; }
        public string StartDate { get; set; } = string.Empty;
        public string EndDate { get; set; } = string.Empty;
    }

    public class AddWorkExperienceDto
    {
        public string ApplicationNo { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsCurrent { get; set; }
        public string Responsibility { get; set; } = string.Empty;
    }

    public class RelationshipDto
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationNo { get; set; } = string.Empty;
        public string Names { get; set; } = string.Empty;
        public string PhoneNo { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
        public string Relationship { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
    }

    public class AddRelationshipDto
    {
        public string ApplicationNo { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string MiddleName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string PhoneNo { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Relationship { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
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

    public class ProfessionalTrainingDto
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationNo { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
        public string Year { get; set; } = string.Empty;
    }

    public class AddProfessionalTrainingDto
    {
        public string ApplicationNo { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
        public int Year { get; set; }
    }

    public class ProfessionalMembershipDto
    {
        public string Id { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string MembershipNo { get; set; } = string.Empty;
        public string MembershipDate { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }

    public class AddProfessionalMembershipDto
    {
        public string ApplicationNo { get; set; } = string.Empty;
        public string BodyName { get; set; } = string.Empty;
        public string MembershipNo { get; set; } = string.Empty;
        public DateTime? MembershipDate { get; set; }
        /// <summary>1 Active, 2 Inactive.</summary>
        public int Status { get; set; } = 1;
    }
}
