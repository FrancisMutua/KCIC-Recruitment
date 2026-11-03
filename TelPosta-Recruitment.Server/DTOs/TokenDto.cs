using System.Text.Json.Serialization;

namespace Recruitment.Server.DTOs
{
    public class TokenDto
    {
        [JsonPropertyName("accessToken")]
        public string AccessToken { get; set; } = string.Empty;

        [JsonPropertyName("refreshToken")]
        public string RefreshToken { get; set; } = string.Empty;

        [JsonPropertyName("expiresIn")]
        public int ExpiresIn { get; set; }

        [JsonPropertyName("tokenType")]
        public string TokenType { get; set; } = "Bearer";

        [JsonPropertyName("isProfileUpdated")]
        public bool IsProfileUpdated { get; set; }
    }
}
