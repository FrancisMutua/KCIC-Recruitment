using System.Text.Json;
using System.Text.Json.Nodes;

namespace Recruitment.Server.Utilities
{
    /// <summary>
    /// Helpers for the JSON text returned by codeunit 70007. Keys are matched case-insensitively
    /// (the codeunit mixes camelCase list rows with PascalCase detail objects), and blank or
    /// invalid input is treated as "no data".
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

        /// <summary>The rows of a JSON array as objects.</summary>
        public static List<JsonObject> Rows(string? json) => Array(json).OfType<JsonObject>().ToList();

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
            var value = Find(node, key);
            if (value is null) return string.Empty;
            return (value.GetValueKind() == JsonValueKind.String ? value.GetValue<string>() : value.ToJsonString()).Trim();
        }

        /// <summary>Reads a JSON boolean (also accepts "true"/"Yes" text); false when missing.</summary>
        public static bool Bool(JsonNode? node, string key)
        {
            var value = Find(node, key);
            if (value is null) return false;
            if (value.GetValueKind() is JsonValueKind.True) return true;
            if (value.GetValueKind() is JsonValueKind.False) return false;
            var text = Text(node, key);
            return text.Equals("true", StringComparison.OrdinalIgnoreCase) || text.Equals("yes", StringComparison.OrdinalIgnoreCase);
        }

        private static JsonNode? Find(JsonNode? node, string key)
        {
            if (node is not JsonObject obj) return null;
            if (obj.TryGetPropertyValue(key, out var exact)) return exact;
            foreach (var (name, value) in obj)
                if (string.Equals(name, key, StringComparison.OrdinalIgnoreCase)) return value;
            return null;
        }
    }
}
