using System.Text.Json.Nodes;

namespace Recruitment.Server.Utilities
{
    public static class JsonUtilities
    {
        public static JsonObject FlattenNavResponse(string json)
        {
            if (string.IsNullOrEmpty(json)) return new JsonObject();

            var obj = JsonNode.Parse(json)?.AsObject();
            if (obj == null) return new JsonObject();

            return FlattenToken(obj) as JsonObject ?? new JsonObject();
        }

        private static JsonNode? FlattenToken(JsonNode? token)
        {
            if (token is JsonObject obj)
            {
                var newObj = new JsonObject();
                foreach (var property in obj)
                {
                    newObj[property.Key] = FlattenToken(property.Value);
                }
                return newObj;
            }
            else if (token is JsonArray array)
            {
                if (array.Count == 0)
                {
                    return JsonValue.Create("");
                }
                if (array.Count == 1)
                {
                    return FlattenToken(array[0]);
                }
                
                var newArray = new JsonArray();
                foreach (var item in array)
                {
                    newArray.Add(FlattenToken(item));
                }
                return newArray;
            }

            return token?.DeepClone();
        }
    }
}
