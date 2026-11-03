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

namespace Recruitment.Server.Services
{
    public class DropDownService : IDropDownService
    {
        private readonly HttpClient _httpClient;
        private readonly string _odataBaseUrl;
        private readonly IWebService _webService;

        public DropDownService(IConfiguration configuration, IWebService webService)
        {
            _webService = webService;
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

        public async Task<List<DropDownOption>> GetSoapDropDownLists(string dropdownType, Dictionary<string, object>? filters = null)
        {
            var dropDownList = new List<DropDownOption>();
            try
            {
                var soapClient = _webService.ObjNav();
        
                // Pass filters directly as JSON string, not wrapped
                string filterStr = filters != null && filters.Count > 0 
                    ? Newtonsoft.Json.JsonConvert.SerializeObject(filters) 
                    : "";
        
                var response = await soapClient.GetSetupDropDownsAsync(dropdownType, filterStr);
        
                if (string.IsNullOrEmpty(response.return_value))
                {
                    return dropDownList;
                }

                var jsonArray = JArray.Parse(response.return_value);
                if (jsonArray == null) return dropDownList;

                foreach (var item in jsonArray)
                {
                    dropDownList.Add(new DropDownOption
                    {
                        Code = item["Code"]?.ToString(),
                        Description = item["Description"]?.ToString(),
                        Text = item["Description"]?.ToString() ?? item["Code"]?.ToString(),
                        Value = item["Code"]?.ToString()
                    });
                }
            }
            catch (Exception ex)
            {
                // Log the actual error for debugging
                Console.WriteLine($"Error in GetSoapDropDownLists: {ex.Message}");
                throw;
            }
            return dropDownList;
        }

        public async Task<List<DropDownOption>> GetSubCountiesList(string countyName = "")
        {
            var dropDownList = new List<DropDownOption>();
            try
            {
                var soapClient = _webService.ObjNav();
                var response = await soapClient.GetSubCountiesAsync(countyName ?? "");
                
                if (string.IsNullOrEmpty(response.return_value))
                {
                    return dropDownList;
                }

                var jsonArray = JArray.Parse(response.return_value);
                if (jsonArray == null) return dropDownList;

                foreach (var item in jsonArray)
                {
                    dropDownList.Add(new DropDownOption
                    {
                        Code = item["Code"]?.ToString(),
                        Description = item["Description"]?.ToString(),
                        Text = item["Description"]?.ToString() ?? item["Code"]?.ToString(),
                        Value = item["Code"]?.ToString()
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetSubCountiesList: {ex.Message}");
                throw;
            }
            return dropDownList;
        }

        public async Task<List<DropDownOption>> GetWardsList(string subCountyName = "")
        {
            var dropDownList = new List<DropDownOption>();
            try
            {
                var soapClient = _webService.ObjNav();
                var response = await soapClient.GetWardsAsync(subCountyName ?? "");
                
                if (string.IsNullOrEmpty(response.return_value))
                {
                    return dropDownList;
                }

                var jsonArray = JArray.Parse(response.return_value);
                if (jsonArray == null) return dropDownList;

                foreach (var item in jsonArray)
                {
                    dropDownList.Add(new DropDownOption
                    {
                        Code = item["Code"]?.ToString(),
                        Description = item["Description"]?.ToString(),
                        Text = item["Description"]?.ToString() ?? item["Code"]?.ToString(),
                        Value = item["Code"]?.ToString()
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetWardsList: {ex.Message}");
                throw;
            }
            return dropDownList;
        }

        public async Task<List<DropDownOption>> GetDisabilityTypesList()
        {
            var dropDownList = new List<DropDownOption>();
            try
            {
                var soapClient = _webService.ObjNav();
                var response = await soapClient.GetDisabilityTypesAsync();
                
                if (string.IsNullOrEmpty(response.return_value))
                {
                    return dropDownList;
                }

                var jsonArray = JArray.Parse(response.return_value);
                if (jsonArray == null) return dropDownList;

                foreach (var item in jsonArray)
                {
                    dropDownList.Add(new DropDownOption
                    {
                        Code = item["Code"]?.ToString(),
                        Description = item["Description"]?.ToString(),
                        Text = item["Description"]?.ToString() ?? item["Code"]?.ToString(),
                        Value = item["Code"]?.ToString()
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetDisabilityTypesList: {ex.Message}");
                throw;
            }
            return dropDownList;
        }
    }
}
