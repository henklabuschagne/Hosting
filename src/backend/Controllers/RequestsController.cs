using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using HostingPlatform.API.DTOs;
using HostingPlatform.API.Services;

namespace HostingPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RequestsController : ControllerBase
{
    private readonly IRequestService _requestService;

    public RequestsController(IRequestService requestService)
    {
        _requestService = requestService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TierRequestDTO>>> GetAllRequests()
    {
        try
        {
            var requests = await _requestService.GetAllTierRequestsAsync();
            return Ok(requests);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TierRequestDTO>> GetRequestById(int id)
    {
        try
        {
            var request = await _requestService.GetTierRequestByIdAsync(id);
            
            if (request == null)
            {
                return NotFound(new { message = "Request not found" });
            }

            return Ok(request);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<TierRequestDTO>> CreateRequest([FromBody] CreateTierRequestDTO request)
    {
        try
        {
            var tierRequest = await _requestService.CreateTierRequestAsync(request);
            return CreatedAtAction(nameof(GetRequestById), new { id = tierRequest.RequestId }, tierRequest);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}/status")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<TierRequestDTO>> UpdateRequestStatus(int id, [FromBody] UpdateTierRequestStatusDTO request)
    {
        try
        {
            var userId = GetUserIdFromToken();
            var tierRequest = await _requestService.UpdateTierRequestStatusAsync(id, request, userId);
            return Ok(tierRequest);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> DeleteRequest(int id)
    {
        try
        {
            var userId = GetUserIdFromToken();
            await _requestService.DeleteTierRequestAsync(id, userId);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private int? GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null ? int.Parse(userIdClaim) : null;
    }
}
