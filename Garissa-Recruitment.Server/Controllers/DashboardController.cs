using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using Recruitment.Server.DTOs;
using Recruitment.Server.Interfaces;
using Recruitment.Server.Models;
using Recruitment.Server.Utilities;

namespace Recruitment.Server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("/api/dashboard")]
    public class DashboardController(IRecruitmentService bc, ILogger<DashboardController> logger) : Controller
    {
        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            try
            {
                var email = User.FindFirst("username")?.Value;
                if (string.IsNullOrEmpty(email))
                    return Unauthorized(new ApiResponse<object> { Success = false, Message = "Please sign in again." });

                var result = await bc.GetApplicationStatisticsAsync(email);
                var stats = string.IsNullOrWhiteSpace(result)
                    ? new DashboardStatsDto()
                    : JsonSerializer.Deserialize<DashboardStatsDto>(result, BcJson.Options) ?? new DashboardStatsDto();
                return Ok(new ApiResponse<DashboardStatsDto> { Success = true, Data = stats });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error loading dashboard statistics");
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Could not load your dashboard. Please try again." });
            }
        }
    }
}
