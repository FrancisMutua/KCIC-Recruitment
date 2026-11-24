namespace Recruitment.Server.Utilities
{
    /// <summary>Raised for applicant input that Business Central cannot store; the message is shown as-is.</summary>
    public class PortalValidationException(string message) : Exception(message);

    /// <summary>Converts portal values into what codeunit 70007's parameters can hold.</summary>
    public static class BcValue
    {
        /// <summary>Trims and cuts text to an AL Text[length] parameter so BC does not reject it.</summary>
        public static string Text(string? value, int length)
        {
            var text = (value ?? string.Empty).Trim();
            return text.Length > length ? text[..length] : text;
        }

        /// <summary>Same as <see cref="Text"/> but upper-cased, as AL stores Code[length] values.</summary>
        public static string Code(string? value, int length) => Text(value, length).ToUpperInvariant();

        /// <summary>
        /// Codeunit 70007 takes phone numbers as AL Integer (max 2,147,483,647), so the leading 0 and
        /// the 254 country code cannot be stored. Kenyan numbers are sent as their 9-digit national
        /// number (0712 345 678 → 712345678) and shown again with the leading 0 by <see cref="PhoneForDisplay"/>.
        /// </summary>
        public static int Phone(string? value, string label, bool required = true)
        {
            var digits = new string((value ?? string.Empty).Where(char.IsDigit).ToArray());
            if (digits.Length == 0)
            {
                if (required) throw new PortalValidationException($"{label} is required.");
                return 0;
            }
            if (digits.StartsWith("254") && digits.Length == 12) digits = digits[3..];
            digits = digits.TrimStart('0');
            if (digits.Length is < 7 or > 9 || !int.TryParse(digits, out var number))
                throw new PortalValidationException($"{label} must be a Kenyan phone number such as 0712 345 678.");
            return number;
        }

        /// <summary>Shows a phone number stored by <see cref="Phone"/> with its leading 0 ("" for 0 or blank).</summary>
        public static string PhoneForDisplay(string? stored)
        {
            var digits = new string((stored ?? string.Empty).Where(char.IsDigit).ToArray()).TrimStart('0');
            if (digits.Length == 0) return string.Empty;
            return digits.Length == 9 ? "0" + digits : digits;
        }

        /// <summary>Date parameters: BC reads 0001-01-01 as a blank date (0D).</summary>
        public static DateTime Date(DateTime? value) => value ?? DateTime.MinValue;
    }
}
