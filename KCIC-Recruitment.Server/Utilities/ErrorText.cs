namespace Recruitment.Server.Utilities
{
    /// <summary>The exact error text of an exception, including inner exceptions.</summary>
    public static class ErrorText
    {
        public static string From(Exception ex)
        {
            var messages = new List<string>();
            for (var current = ex; current != null; current = current.InnerException)
            {
                var message = current.Message?.Trim();
                if (!string.IsNullOrEmpty(message) && !messages.Any(m => m.Contains(message))) messages.Add(message);
            }
            return string.Join(" → ", messages);
        }
    }
}
