using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HostingPlatform.API.DTOs;
using HostingPlatform.API.Services;

namespace HostingPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardStatsDTO>> GetDashboardStats()
    {
        try
        {
            var stats = await _analyticsService.GetDashboardStatsAsync();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("server-utilization")]
    public async Task<ActionResult<IEnumerable<ServerUtilizationReportDTO>>> GetServerUtilization()
    {
        try
        {
            var utilization = await _analyticsService.GetServerUtilizationReportAsync();
            return Ok(utilization);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("revenue-by-tier")]
    public async Task<ActionResult<IEnumerable<RevenueByTierDTO>>> GetRevenueByTier()
    {
        try
        {
            var revenue = await _analyticsService.GetRevenueByTierAsync();
            return Ok(revenue);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("client-distribution")]
    public async Task<ActionResult<IEnumerable<ClientDistributionDTO>>> GetClientDistribution()
    {
        try
        {
            var distribution = await _analyticsService.GetClientDistributionAsync();
            return Ok(distribution);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("top-clients")]
    public async Task<ActionResult<IEnumerable<TopClientDTO>>> GetTopClients([FromQuery] int topN = 10)
    {
        try
        {
            var topClients = await _analyticsService.GetTopClientsByUsageAsync(topN);
            return Ok(topClients);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
