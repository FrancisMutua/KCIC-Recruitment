namespace Recruitment.Server.Models;

public class Enums
{
    public enum EmployeeGender
    {
        None = 0,
        Female = 1,
        Male = 2,
        NonBinary = 3,
        SelfDescribed = 4,
        PreferNotToAnswer = 5
    }

    public enum MaritalStatus
    {
        Single = 0,
        Married = 1,
        Divorced = 2,
        Widow = 3,
        Widower = 4,
        Complicated = 5
    }
}

