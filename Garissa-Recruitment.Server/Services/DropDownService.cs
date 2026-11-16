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
            
            try 
            {
                var requestUrl = _odataBaseUrl + page;
                var response = await _httpClient.GetAsync(requestUrl);
                
                if (!response.IsSuccessStatusCode)
                {
                    return dropDownList;
                }

                var result = await response.Content.ReadAsStringAsync();
                
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
            catch (Exception)
            {
                // Log error if needed
            }

            return dropDownList;
        }

        /// <summary>
        /// Codeunit 50034 GetSetupDropDowns supports: County, Religion, Countries, AcademicQualifications.
        /// "Citizenship" reuses the country list. Anything else returns an empty list.
        /// </summary>
        public async Task<List<DropDownOption>> GetSoapDropDownLists(string dropdownType, Dictionary<string, object>? filters = null)
        {
            var bcType = dropdownType switch
            {
                "Citizenship" => "Countries",
                _ => dropdownType
            };
            if (bcType is not ("County" or "Religion" or "Countries" or "AcademicQualifications")) return [];
            return ToOptions(await _recruitment.GetSetupDropDownsAsync(bcType, string.Empty));
        }

        // GetSubCounties / GetWards are empty stubs in codeunit 50034.
        public Task<List<DropDownOption>> GetSubCountiesList(string countyName = "") => Task.FromResult(new List<DropDownOption>());

        public Task<List<DropDownOption>> GetWardsList(string subCountyName = "") => Task.FromResult(new List<DropDownOption>());

        public async Task<List<DropDownOption>> GetDisabilityTypesList() =>
            ToOptions(await _recruitment.GetDisabilityTypesAsync());

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
