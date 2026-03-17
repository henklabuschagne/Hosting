using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using HostingPlatform.API.DTOs.Servers;
using HostingPlatform.API.Repositories;

namespace HostingPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ServersController : ControllerBase
    {
        private readonly IServerRepository _serverRepository;

        public ServersController(IServerRepository serverRepository)
        {
            _serverRepository = serverRepository;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllServers()
        {
            try
            {
                var servers = await _serverRepository.GetAllServersAsync();
                var serverDtos = servers.Select(s => new ServerDto
                {
                    ServerId = s.ServerId,
                    ServerName = s.ServerName,
                    TierId = s.TierId,
                    TierName = s.TierName,
                    TierDisplayName = s.TierDisplayName,
                    ServerType = s.ServerType,
                    HostingType = s.HostingType,
                    CpuCores = s.CpuCores,
                    RamGB = s.RamGB,
                    StorageGB = s.StorageGB,
                    Location = s.Location,
                    IpAddress = s.IpAddress,
                    CurrentEntities = s.CurrentEntities,
                    CurrentTemplates = s.CurrentTemplates,
                    CurrentUsers = s.CurrentUsers,
                    Status = s.Status,
                    IsActive = s.IsActive,
                    CreatedDate = s.CreatedDate,
                    ModifiedDate = s.ModifiedDate,
                    Notes = s.Notes
                }).ToList();

                return Ok(serverDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching servers", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetServerById(int id)
        {
            try
            {
                var server = await _serverRepository.GetServerByIdAsync(id);
                
                if (server == null)
                {
                    return NotFound(new { message = "Server not found" });
                }

                var serverDto = new ServerDto
                {
                    ServerId = server.ServerId,
                    ServerName = server.ServerName,
                    TierId = server.TierId,
                    TierName = server.TierName,
                    TierDisplayName = server.TierDisplayName,
                    ServerType = server.ServerType,
                    HostingType = server.HostingType,
                    CpuCores = server.CpuCores,
                    RamGB = server.RamGB,
                    StorageGB = server.StorageGB,
                    Location = server.Location,
                    IpAddress = server.IpAddress,
                    CurrentEntities = server.CurrentEntities,
                    CurrentTemplates = server.CurrentTemplates,
                    CurrentUsers = server.CurrentUsers,
                    Status = server.Status,
                    IsActive = server.IsActive,
                    CreatedDate = server.CreatedDate,
                    ModifiedDate = server.ModifiedDate,
                    Notes = server.Notes
                };

                return Ok(serverDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching server", error = ex.Message });
            }
        }

        [HttpGet("tier/{tierId}")]
        public async Task<IActionResult> GetServersByTier(int tierId)
        {
            try
            {
                var servers = await _serverRepository.GetServersByTierAsync(tierId);
                var serverDtos = servers.Select(s => new ServerDto
                {
                    ServerId = s.ServerId,
                    ServerName = s.ServerName,
                    TierId = s.TierId,
                    TierName = s.TierName,
                    TierDisplayName = s.TierDisplayName,
                    ServerType = s.ServerType,
                    HostingType = s.HostingType,
                    CpuCores = s.CpuCores,
                    RamGB = s.RamGB,
                    StorageGB = s.StorageGB,
                    Location = s.Location,
                    IpAddress = s.IpAddress,
                    CurrentEntities = s.CurrentEntities,
                    CurrentTemplates = s.CurrentTemplates,
                    CurrentUsers = s.CurrentUsers,
                    Status = s.Status,
                    IsActive = s.IsActive,
                    CreatedDate = s.CreatedDate,
                    ModifiedDate = s.ModifiedDate,
                    Notes = s.Notes
                }).ToList();

                return Ok(serverDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching servers", error = ex.Message });
            }
        }

        [HttpGet("type/{serverType}")]
        public async Task<IActionResult> GetServersByType(string serverType)
        {
            try
            {
                var servers = await _serverRepository.GetServersByTypeAsync(serverType);
                var serverDtos = servers.Select(s => new ServerDto
                {
                    ServerId = s.ServerId,
                    ServerName = s.ServerName,
                    TierId = s.TierId,
                    TierName = s.TierName,
                    TierDisplayName = s.TierDisplayName,
                    ServerType = s.ServerType,
                    HostingType = s.HostingType,
                    CpuCores = s.CpuCores,
                    RamGB = s.RamGB,
                    StorageGB = s.StorageGB,
                    Location = s.Location,
                    IpAddress = s.IpAddress,
                    CurrentEntities = s.CurrentEntities,
                    CurrentTemplates = s.CurrentTemplates,
                    CurrentUsers = s.CurrentUsers,
                    Status = s.Status,
                    IsActive = s.IsActive,
                    CreatedDate = s.CreatedDate,
                    ModifiedDate = s.ModifiedDate,
                    Notes = s.Notes
                }).ToList();

                return Ok(serverDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching servers", error = ex.Message });
            }
        }

        [HttpGet("available")]
        public async Task<IActionResult> GetAvailableServers([FromQuery] int? tierId, [FromQuery] string serverType, [FromQuery] string hostingType)
        {
            try
            {
                var servers = await _serverRepository.GetAvailableServersAsync(tierId, serverType, hostingType);
                return Ok(servers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching available servers", error = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateServer([FromBody] CreateServerDto request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var server = await _serverRepository.CreateServerAsync(request, userId);

                var serverDto = new ServerDto
                {
                    ServerId = server.ServerId,
                    ServerName = server.ServerName,
                    TierId = server.TierId,
                    TierName = server.TierName,
                    TierDisplayName = server.TierDisplayName,
                    ServerType = server.ServerType,
                    HostingType = server.HostingType,
                    CpuCores = server.CpuCores,
                    RamGB = server.RamGB,
                    StorageGB = server.StorageGB,
                    Location = server.Location,
                    IpAddress = server.IpAddress,
                    CurrentEntities = server.CurrentEntities,
                    CurrentTemplates = server.CurrentTemplates,
                    CurrentUsers = server.CurrentUsers,
                    Status = server.Status,
                    IsActive = server.IsActive,
                    CreatedDate = server.CreatedDate,
                    ModifiedDate = server.ModifiedDate,
                    Notes = server.Notes
                };

                return Ok(serverDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating server", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateServer(int id, [FromBody] UpdateServerDto request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var server = await _serverRepository.UpdateServerAsync(id, request, userId);

                if (server == null)
                {
                    return NotFound(new { message = "Server not found" });
                }

                var serverDto = new ServerDto
                {
                    ServerId = server.ServerId,
                    ServerName = server.ServerName,
                    TierId = server.TierId,
                    TierName = server.TierName,
                    TierDisplayName = server.TierDisplayName,
                    ServerType = server.ServerType,
                    HostingType = server.HostingType,
                    CpuCores = server.CpuCores,
                    RamGB = server.RamGB,
                    StorageGB = server.StorageGB,
                    Location = server.Location,
                    IpAddress = server.IpAddress,
                    CurrentEntities = server.CurrentEntities,
                    CurrentTemplates = server.CurrentTemplates,
                    CurrentUsers = server.CurrentUsers,
                    Status = server.Status,
                    IsActive = server.IsActive,
                    CreatedDate = server.CreatedDate,
                    ModifiedDate = server.ModifiedDate,
                    Notes = server.Notes
                };

                return Ok(serverDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating server", error = ex.Message });
            }
        }

        [HttpPut("{id}/load")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateServerLoad(int id, [FromBody] UpdateServerLoadDto request)
        {
            try
            {
                var server = await _serverRepository.UpdateServerLoadAsync(id, request);

                if (server == null)
                {
                    return NotFound(new { message = "Server not found" });
                }

                var serverDto = new ServerDto
                {
                    ServerId = server.ServerId,
                    ServerName = server.ServerName,
                    TierId = server.TierId,
                    TierName = server.TierName,
                    TierDisplayName = server.TierDisplayName,
                    ServerType = server.ServerType,
                    HostingType = server.HostingType,
                    CpuCores = server.CpuCores,
                    RamGB = server.RamGB,
                    StorageGB = server.StorageGB,
                    Location = server.Location,
                    IpAddress = server.IpAddress,
                    CurrentEntities = server.CurrentEntities,
                    CurrentTemplates = server.CurrentTemplates,
                    CurrentUsers = server.CurrentUsers,
                    Status = server.Status,
                    IsActive = server.IsActive,
                    CreatedDate = server.CreatedDate,
                    ModifiedDate = server.ModifiedDate,
                    Notes = server.Notes
                };

                return Ok(serverDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating server load", error = ex.Message });
            }
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateServerStatus(int id, [FromBody] UpdateServerStatusDto request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var server = await _serverRepository.UpdateServerStatusAsync(id, request.Status, userId);

                if (server == null)
                {
                    return NotFound(new { message = "Server not found" });
                }

                var serverDto = new ServerDto
                {
                    ServerId = server.ServerId,
                    ServerName = server.ServerName,
                    TierId = server.TierId,
                    TierName = server.TierName,
                    TierDisplayName = server.TierDisplayName,
                    ServerType = server.ServerType,
                    HostingType = server.HostingType,
                    CpuCores = server.CpuCores,
                    RamGB = server.RamGB,
                    StorageGB = server.StorageGB,
                    Location = server.Location,
                    IpAddress = server.IpAddress,
                    CurrentEntities = server.CurrentEntities,
                    CurrentTemplates = server.CurrentTemplates,
                    CurrentUsers = server.CurrentUsers,
                    Status = server.Status,
                    IsActive = server.IsActive,
                    CreatedDate = server.CreatedDate,
                    ModifiedDate = server.ModifiedDate,
                    Notes = server.Notes
                };

                return Ok(serverDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating server status", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteServer(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _serverRepository.DeleteServerAsync(id, userId);
                return Ok(new { message = "Server deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting server", error = ex.Message });
            }
        }

        [HttpGet("statistics")]
        public async Task<IActionResult> GetServerStatistics()
        {
            try
            {
                var stats = await _serverRepository.GetServerStatisticsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching statistics", error = ex.Message });
            }
        }

        [HttpGet("{id}/capacity")]
        public async Task<IActionResult> GetServerCapacity(int id)
        {
            try
            {
                var summary = await _serverRepository.GetServerCapacitySummaryAsync(id);
                
                if (summary == null)
                {
                    return NotFound(new { message = "Server not found" });
                }

                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching server capacity", error = ex.Message });
            }
        }
    }
}
