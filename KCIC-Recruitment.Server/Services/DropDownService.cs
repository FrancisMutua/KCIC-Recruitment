using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using Recruitment.Server.DTOs;
using Recruitment.Server.Interfaces;
using Recruitment.Server.Utilities;

namespace Recruitment.Server.Services
{
    public class DropDownService : IDropDownService
    {
        private readonly HttpClient _httpClient;
        private readonly string _odataBaseUrl;
        private readonly IRecruitmentService _recruitment;

        public DropDownService(IConfiguration configuration, IRecruitmentService recruitment)
        {
            _recruitment = recruitment;
            var baseUrl = configuration["BusinessCentral:BaseUrl"]!;
            var username = configuration["BusinessCentral:Username"]!;
            var password = configuration["BusinessCentral:Password"]!;
            
            try 
            {
                var uri = new Uri(baseUrl);
                var segments = uri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
                
                string instance = segments.Length > 0 ? segments[0] : "BC";
                string company = segments.Length > 2 ? segments[2] : "";
                
                var odataPort = uri.Port + 1; // 7047 -> 7048
                
                _odataBaseUrl = $"{uri.Scheme}://{uri.Host}:{odataPort}/{instance}/ODataV4/Company('{company}')/";
            }
            catch
            {
                // Fallback attempt if URI parsing fails
                _odataBaseUrl = baseUrl.Replace(":7047/", ":7048/")
                                      .Replace("/WS/", "/ODataV4/")
                                      .Split("/Codeunit/")[0] + "/";
            }

            _httpClient = new HttpClient();
            var authHeaderValue = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{username}:{password}"));
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authHeaderValue);
        }

        public string BuildODataQuery(DropDownRequest request)
        {
            var queryParams = new List<string>();

            if (request.Filters != null && request.Filters.Any())
            {
                var filterParts = request.Filters.Select(f =>
                {
                    var key = f.Key;
                    var value = f.Value;

                    if (value is JsonElement element)
                    {
                        switch (element.ValueKind)
                        {
                            case JsonValueKind.String:
                                return $"{key} eq '{element.GetString()?.Replace("'", "''")}'";
                            case JsonValueKind.True:
                            case JsonValueKind.False:
                                return $"{key} eq {element.GetBoolean().ToString().ToLower()}";
                            case JsonValueKind.Number:
                                return $"{key} eq {element.GetRawText()}";
                            default:
                                throw new InvalidOperationException($"Unsupported JSON value kind: {element.ValueKind}");
                        }
                    }

                    return value switch
                    {
                        bool b => $"{key} eq {b.ToString().ToLower()}",
                        string s => $"{key} eq '{s.Replace("'", "''")}'",
                        int i => $"{key} eq {i}",
                        _ => throw new InvalidOperationException($"Unsupported filter type for key '{key}': {value?.GetType().Name}")
                    };
                });

                var filterQuery = string.Join(" and ", filterParts);
                queryParams.Add($"$filter={filterQuery}");
            }

            queryParams.Add("$format=json");

            return $"{request.Page}?{string.Join("&", queryParams)}";
        }

        public async Task<List<DropDownOption>> GetDropDownLists(string page, string code, string description, int merge)
        {
            var dropDownList = new List<DropDownOption>();
            
            {
                var requestUrl = _odataBaseUrl + page;
                var response = await _httpClient.GetAsync(requestUrl);
                var result = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    // BC OData errors are JSON {"error":{"message":...}}; fall back to the raw body.
                    string detail = result;
                    try { detail = JObject.Parse(result)["error"]?["message"]?.ToString() ?? result; } catch { }
                    throw new HttpRequestException($"Business Central OData {page}: HTTP {(int)response.StatusCode} {response.ReasonPhrase} - {detail}".TrimEnd(' ', '-'));
                }
                
                if (string.IsNullOrEmpty(result))
                {
                    return dropDownList;
                }

                var jsonObject = JObject.Parse(result);
                var jsonArray = jsonObject["value"] as JArray;

                if (jsonArray == null || !jsonArray.Any())
                {
                    return dropDownList;
                }

                dropDownList.AddRange(jsonArray.Select(item =>
                {
                    var codeValue = item[code]?.ToString();
                    var descValue = item[description]?.ToString();

                    return new DropDownOption
                    {
                        Code = codeValue,
                        Description = descValue,
                        Text = merge switch
                        {
                            0 => codeValue,
                            1 => descValue,
                            _ => descValue
                        },
                        Value = codeValue
                    };
                }));
            }

            return dropDownList;
        }

        /// <summary>
        /// Lists for the application forms. Codeunit 70007 GetSetupDropDowns reads "HRM-Lookup Values"
        /// (types such as County, Religion, Language, Qualification Type). Countries come from the
        /// ISO 3166 list, matching the 2-letter codes BC uses for "Country/Region".
        /// </summary>
        public async Task<List<DropDownOption>> GetSoapDropDownLists(string dropdownType, Dictionary<string, object>? filters = null)
        {
            switch (dropdownType)
            {
                case "Countries":
                case "Citizenship":
                    return Countries.Value;
                case "County":
                    var counties = ToOptions(await _recruitment.GetSetupDropDownsAsync("County"));
                    return counties.Count > 0 ? counties : KenyanCounties;
                default:
                    return ToOptions(await _recruitment.GetSetupDropDownsAsync(dropdownType));
            }
        }

        // Codeunit 70007 has no sub-county or ward lists.
        public Task<List<DropDownOption>> GetSubCountiesList(string countyName = "") => Task.FromResult(new List<DropDownOption>());

        public Task<List<DropDownOption>> GetWardsList(string subCountyName = "") => Task.FromResult(new List<DropDownOption>());

        private static readonly Lazy<List<DropDownOption>> Countries = new(() =>
            System.Globalization.CultureInfo.GetCultures(System.Globalization.CultureTypes.SpecificCultures)
                .Select(culture => { try { return new System.Globalization.RegionInfo(culture.Name); } catch (ArgumentException) { return null; } })
                .Where(region => region != null && region.TwoLetterISORegionName.Length == 2 && char.IsLetter(region.TwoLetterISORegionName[0]))
                .GroupBy(region => region!.TwoLetterISORegionName)
                .Select(group => group.First()!)
                .OrderBy(region => region.TwoLetterISORegionName == "KE" ? 0 : 1).ThenBy(region => region.EnglishName)
                .Select(region => new DropDownOption { Code = region.TwoLetterISORegionName, Description = region.EnglishName, Text = region.EnglishName, Value = region.TwoLetterISORegionName })
                .ToList());

        /// <summary>Used when KCIC has not set up County lookup values in BC.</summary>
        private static readonly List<DropDownOption> KenyanCounties = new[]
        {
            "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa", "Homa Bay", "Isiolo", "Kajiado",
            "Kakamega", "Kericho", "Kiambu", "Kilifi", "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu",
            "Machakos", "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi", "Nakuru", "Nandi",
            "Narok", "Nyamira", "Nyandarua", "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi",
            "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
        }.Select(name => new DropDownOption { Code = name.ToUpperInvariant(), Description = name, Text = name, Value = name.ToUpperInvariant() }).ToList();

        private static List<DropDownOption> ToOptions(string json) =>
            BcJson.Array(json).Select(item => new DropDownOption
            {
                Code = BcJson.Text(item, "Code"),
                Description = BcJson.Text(item, "Description"),
                Text = string.IsNullOrWhiteSpace(BcJson.Text(item, "Description")) ? BcJson.Text(item, "Code") : BcJson.Text(item, "Description"),
                Value = BcJson.Text(item, "Code")
            }).ToList();
    }
}
