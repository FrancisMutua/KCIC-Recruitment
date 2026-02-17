using Microsoft.AspNetCore.Mvc;
using NAVWS;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Recruitment.Library.DTOs;
using Recruitment.Library.Interfaces;
using Recruitment.Library.Services;

namespace Recruitment.Server.Controllers
{
    [ApiController]
    [Route("/api/settings")]
    public class SettingsController(IWebService webService) : Controller
    {
        private readonly Recruitment_PortClient webportals = webService.ObjNav();

        [HttpGet("getcountries")]
        public async Task<IActionResult> GetCountries()
        {
            try
            {
                // 1. Invoke the external service asynchronously to retrieve the list of countries.
                var response = await webportals.GetCountriesAsync();

                // 2. Extract the raw data content (typically a JSON string) from the service's response property.
                var result = response.return_value;

                // 3. Convert the JSON string into a strongly-typed List of ConfigDto objects.
                var data = JsonConvert.DeserializeObject<List<ConfigDto>>(result) ?? [];

                // 4. Return the data as a JSON result. 
                return Json(data);
            }
            catch (Exception ex)
            {
                // 5. Catch failures such as network timeouts, service errors, or JSON parsing issues.
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("getethnicity")]
        public async Task<IActionResult> GetEthnicity()
        {
            try
            {
                // 1. Invoke the external service asynchronously to retrieve the list of countries.
                var response = await webportals.GetEthnicityAsync();

                // 2. Extract the raw data content (typically a JSON string) from the service's response property.
                var result = response.return_value;

                // 3. Convert the JSON string into a strongly-typed List of ConfigDto objects.
                var data = JsonConvert.DeserializeObject<List<ConfigDto>>(result) ?? [];

                // 4. Return the data as a JSON result. 
                return Json(data);
            }
            catch (Exception ex)
            {
                // 5. Catch failures such as network timeouts, service errors, or JSON parsing issues.
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("getcounties")]
        public async Task<IActionResult> GetCounties()
        {
            try
            {
                // 1. Invoke the external service asynchronously to retrieve the list of countries.
                var response = await webportals.GetCountiesAsync();

                // 2. Extract the raw data content (typically a JSON string) from the service's response property.
                var result = response.return_value;

                // 3. Convert the JSON string into a strongly-typed List of ConfigDto objects.
                var data = JsonConvert.DeserializeObject<List<ConfigDto>>(result) ?? [];

                // 4. Return the data as a JSON result. 
                return Json(data);
            }
            catch (Exception ex)
            {
                // 5. Catch failures such as network timeouts, service errors, or JSON parsing issues.
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("getareasofstudy")]
        public async Task<IActionResult> GetAreaoOfStudy()
        {
            try
            {
                // 1. Invoke the external service asynchronously to retrieve the list of areas of study.
                var response = await webportals.GetAreaOfStudyAsync();

                // 2. Extract the raw data content (typically a JSON string) from the service's response property.
                var result = response.return_value;

                // 3. Convert the JSON string into a strongly-typed List of ConfigDto objects.
                var data = JsonConvert.DeserializeObject<List<ConfigDto>>(result) ?? [];

                // 4. Return the data as a JSON result. 
                return Json(data);
            }
            catch (Exception ex)
            {
                // 5. Catch failures such as network timeouts, service errors, or JSON parsing issues.
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("getqualifications")]
        public async Task<IActionResult> GetQualifications()
        {
            try
            {
                // 1. Invoke the external service asynchronously to retrieve the list of qualifications
                var response = await webportals.GetQualificationsAsync();

                // 2. Extract the raw data content (typically a JSON string) from the service's response property.
                var result = response.return_value;

                // 3. Convert the JSON string into a strongly-typed List of ConfigDto objects.
                var data = JsonConvert.DeserializeObject<List<ConfigDto>>(result) ?? [];

                // 4. Return the data as a JSON result. 
                return Json(data);
            }
            catch (Exception ex)
            {
                // 5. Catch failures such as network timeouts, service errors, or JSON parsing issues.
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
