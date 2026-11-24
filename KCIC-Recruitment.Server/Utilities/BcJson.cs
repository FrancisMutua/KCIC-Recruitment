using System.Text.Json;
using System.Text.Json.Nodes;

namespace Recruitment.Server.Utilities
{
    /// <summary>
    /// Helpers for the JSON text returned by codeunit 50034. List procedures return ""
    /// (not "[]") when there are no records, so every read must tolerate blank input.
    /// </summary>
    public static class BcJson
    {
        public static readonly JsonSerializerOptions Options = new() { PropertyNameCaseInsensitive = true };

        public static JsonArray Array(string? json)
        {
            if (string.IsNullOrWhiteSpace(json)) return [];
            try { return JsonNode.Parse(json) as JsonArray ?? []; }
            catch (JsonException) { return []; }
        }

        public static JsonObject? Object(string? json)
        {
            if (string.IsNullOrWhiteSpace(json)) return null;
            try { return JsonNode.Parse(json) as JsonObject; }
            catch (JsonException) { return null; }
        }

        public static List<T> List<T>(string? json)
        {
            if (string.IsNullOrWhiteSpace(json)) return [];
            try { return JsonSerializer.Deserialize<List<T>>(json, Options) ?? []; }
            catch (JsonException) { return []; }
        }

        /// <summary>Reads a property as trimmed text whatever its JSON type ("" when missing).</summary>
        public static string Text(JsonNode? node, string key)
        {
            var value = node?[key];
            if (value is null) return string.Empty;
            return (value.GetValueKind() == JsonValueKind.String ? value.GetValue<string>() : value.ToJsonString()).Trim();
        }
    }
}
