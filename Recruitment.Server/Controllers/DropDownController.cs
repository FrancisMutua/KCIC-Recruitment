using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Recruitment.Server.DTOs;
using Recruitment.Server.Interfaces;

namespace Recruitment.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DropDownController : ControllerBase
    {
        private readonly IDropDownService _dropDownService;

        public DropDownController(IDropDownService dropDownService)
        {
            _dropDownService = dropDownService;
        }

        [HttpPost("get-drop-down-list")]
        public async Task<IActionResult> GetDropDownList([FromBody] DropDownRequest request)
        {
            try
            {
                List<DropDownOption> dropDownList;

                if (request.Source?.ToUpper() == "SOAP")
                {
                    if (string.IsNullOrWhiteSpace(request.Type))
                    {
                        return BadRequest(new { success = false, message = "Type parameter is required for SOAP source." });
                    }

                    // Use dedicated methods for SubCounty and Ward
                    if (request.Type == "SubCounty")
                    {
                        var countyFilter = request.Filters?.ContainsKey("County") == true 
                            ? request.Filters["County"]?.ToString() ?? ""
                            : "";
                        dropDownList = await _dropDownService.GetSubCountiesList(countyFilter);
                    }
                    else if (request.Type == "Ward")
                    {
                        var subCountyFilter = request.Filters?.ContainsKey("SubCounty") == true 
                            ? request.Filters["SubCounty"]?.ToString() ?? ""
                            : "";
                        dropDownList = await _dropDownService.GetWardsList(subCountyFilter);
                    }
                    else if (request.Type == "Disability Type")
                    {
                        dropDownList = await _dropDownService.GetDisabilityTypesList();
                    }
                    else
                    {
                        dropDownList = await _dropDownService.GetSoapDropDownLists(request.Type, request.Filters);
                    }
                }
                else
                {
                    if (string.IsNullOrWhiteSpace(request.Page))
                    {
                        return BadRequest(new { success = false, message = "Page parameter is required for OData source." });
                    }
                    var odataQuery = _dropDownService.BuildODataQuery(request);
                    dropDownList = await _dropDownService.GetDropDownLists(odataQuery, request.Code, request.Description, request.Merge);
                }

                return Ok(new { success = true, data = dropDownList ?? new List<DropDownOption>(), message = "Dropdown list retrieved successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Failed to retrieve dropdown list.", details = ex.Message });
            }
        }
    }
}
