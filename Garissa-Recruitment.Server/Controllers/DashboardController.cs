using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NAVWS;
using System.Text.Json;
using Recruitment.Server.DTOs;
using Recruitment.Server.Interfaces;
using System.Security.Claims;
using Recruitment.Server.Models;

namespace Recruitment.Server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("/api/dashboard")]
    public class DashboardController(IWebService webService) : Controller
    {
        private readonly Recruitment_PortClient _webportals = webService.ObjNav();

        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            try
            {
                var email = User.FindFirst("username")?.Value;
                if (string.IsNullOrEmpty(email))
                {
                    return Unauthorized(new ApiResponse<object> { Success = false, Message = "User email not found in token." });
                }

                var response = await _webportals.GetApplicationStatisticsAsync(email);
                var result = response.return_value;

                if (string.IsNullOrEmpty(result))
                {
                    return Ok(new ApiResponse<DashboardStatsDto> { Success = true, Data = new DashboardStatsDto() });
                }

                var stats = JsonSerializer.Deserialize<DashboardStatsDto>(result);
                return Ok(new ApiResponse<DashboardStatsDto> { Success = true, Data = stats ?? new DashboardStatsDto() });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
        }
    }
}
