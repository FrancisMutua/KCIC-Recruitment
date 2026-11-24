using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Recruitment.Server.DTOs;
using Recruitment.Server.Interfaces;
using Recruitment.Server.Models;
using Recruitment.Server.Services;
using Recruitment.Server.Utilities;

namespace Recruitment.Server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("/api/dashboard")]
    public class DashboardController(IRecruitmentService bc, ILogger<DashboardController> logger) : Controller
    {
        /// <summary>
        /// Counted from GetApplications and GetAdvertisedJobs rather than GetApplicationStatistics, whose
        /// "submitted" count leaves out applications HR has moved on and whose openings count includes
        /// requisitions the job board does not show.
        /// </summary>
        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            try
            {
                var email = User.FindFirst("username")?.Value;
                if (string.IsNullOrEmpty(email))
                    return Unauthorized(new ApiResponse<object> { Success = false, Message = "Please sign in again." });

                var applicationsTask = bc.GetApplicationsAsync(email);
                var jobsTask = bc.GetAdvertisedJobsAsync();
                await Task.WhenAll(applicationsTask, jobsTask);

                var statuses = BcJson.Rows(applicationsTask.Result).Select(r => BcJson.Text(r, "status")).ToList();
                var stats = new DashboardStatsDto
                {
                    TotalOpenings = BcJson.Array(jobsTask.Result).Count,
                    TotalApplications = statuses.Count,
                    SubmittedApplications = statuses.Count(ApplicationRules.IsSubmitted),
                    SuccessfulApplications = statuses.Count(s => s == "Successful"),
                    DraftApplications = statuses.Count(s => !ApplicationRules.IsSubmitted(s))
                };
                return Ok(new ApiResponse<DashboardStatsDto> { Success = true, Data = stats });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error loading dashboard statistics");
                return BadRequest(new ApiResponse<object> { Success = false, Message = ErrorText.From(ex) });
            }
        }
    }
}
