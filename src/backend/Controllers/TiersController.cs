using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using HostingPlatform.API.DTOs;
using HostingPlatform.API.Services;

namespace HostingPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TiersController : ControllerBase
{
    private readonly ITierService _tierService;

    public TiersController(ITierService tierService)
    {
        _tierService = tierService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ServerTierDTO>>> GetAllTiers()
    {
        try
        {
            var tiers = await _tierService.GetAllServerTiersAsync();
            return Ok(tiers);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ServerTierDTO>> GetTierById(int id)
    {
        try
        {
            var tier = await _tierService.GetServerTierByIdAsync(id);
            
            if (tier == null)
            {
                return NotFound(new { message = "Tier not found" });
            }

            return Ok(tier);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ServerTierDTO>> CreateTier([FromBody] CreateServerTierDTO request)
    {
        try
        {
            var userId = GetUserIdFromToken();
            var tier = await _tierService.CreateServerTierAsync(request, userId);
            return CreatedAtAction(nameof(GetTierById), new { id = tier.TierId }, tier);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ServerTierDTO>> UpdateTier(int id, [FromBody] UpdateServerTierDTO request)
    {
        try
        {
            var userId = GetUserIdFromToken();
            var tier = await _tierService.UpdateServerTierAsync(id, request, userId);
            return Ok(tier);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("recommend")]
    [AllowAnonymous]
    public async Task<ActionResult<TierRecommendationResponseDTO>> GetRecommendation([FromBody] TierRecommendationRequestDTO request)
    {
        try
        {
            var recommendation = await _tierService.GetTierRecommendationAsync(request);
            return Ok(recommendation);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    private int? GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null ? int.Parse(userIdClaim) : null;
    }
}
