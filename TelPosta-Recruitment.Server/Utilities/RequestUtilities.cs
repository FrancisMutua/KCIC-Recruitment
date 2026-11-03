using Microsoft.AspNetCore.Http;

namespace Recruitment.Server.Utilities
{
    public static class RequestUtilities
    {
        public static string GetFrontendUrl(HttpContext context)
        {
            // Try to get from Origin header
            string frontendUrl = context.Request.Headers["Origin"].ToString();

            if (string.IsNullOrEmpty(frontendUrl))
            {
                // Fallback to Referer
                frontendUrl = context.Request.Headers["Referer"].ToString();
                
                if (!string.IsNullOrEmpty(frontendUrl))
                {
                    // If it's a full URL with path, trim it to the root
                    var uri = new System.Uri(frontendUrl);
                    frontendUrl = $"{uri.Scheme}://{uri.Authority}";
                }
            }

            if (string.IsNullOrEmpty(frontendUrl))
            {
                // Absolute fallback (should ideally be configurable but dynamic is preferred)
                frontendUrl = $"{context.Request.Scheme}://{context.Request.Host}";
            }

            // Ensure no trailing slash for consistency
            return frontendUrl.TrimEnd('/');
        }
    }
}
