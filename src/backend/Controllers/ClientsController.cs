using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using HostingPlatform.API.DTOs.Clients;
using HostingPlatform.API.Repositories;

namespace HostingPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClientsController : ControllerBase
    {
        private readonly IClientRepository _clientRepository;

        public ClientsController(IClientRepository clientRepository)
        {
            _clientRepository = clientRepository;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllClients()
        {
            try
            {
                var clients = await _clientRepository.GetAllClientsAsync();
                var clientDtos = clients.Select(c => new ClientDto
                {
                    ClientId = c.ClientId,
                    ClientName = c.ClientName,
                    CompanyName = c.CompanyName,
                    ContactEmail = c.ContactEmail,
                    ContactPhone = c.ContactPhone,
                    CurrentApplicationServerId = c.CurrentApplicationServerId,
                    CurrentDatabaseServerId = c.CurrentDatabaseServerId,
                    HostingType = c.HostingType,
                    TierId = c.TierId,
                    TierName = c.TierName,
                    TierDisplayName = c.TierDisplayName,
                    CurrentEntities = c.CurrentEntities,
                    CurrentTemplates = c.CurrentTemplates,
                    CurrentUsers = c.CurrentUsers,
                    DiscussedMonthlyFee = c.DiscussedMonthlyFee,
                    ActualMonthlyFee = c.ActualMonthlyFee,
                    StartDate = c.StartDate,
                    EndDate = c.EndDate,
                    Status = c.Status,
                    IsActive = c.IsActive,
                    CreatedDate = c.CreatedDate,
                    ModifiedDate = c.ModifiedDate,
                    Notes = c.Notes,
                    ApplicationServerName = c.ApplicationServerName,
                    DatabaseServerName = c.DatabaseServerName
                }).ToList();

                return Ok(clientDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching clients", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetClientById(int id)
        {
            try
            {
                var client = await _clientRepository.GetClientByIdAsync(id);
                
                if (client == null)
                {
                    return NotFound(new { message = "Client not found" });
                }

                var clientDto = new ClientDto
                {
                    ClientId = client.ClientId,
                    ClientName = client.ClientName,
                    CompanyName = client.CompanyName,
                    ContactEmail = client.ContactEmail,
                    ContactPhone = client.ContactPhone,
                    CurrentApplicationServerId = client.CurrentApplicationServerId,
                    CurrentDatabaseServerId = client.CurrentDatabaseServerId,
                    HostingType = client.HostingType,
                    TierId = client.TierId,
                    TierName = client.TierName,
                    TierDisplayName = client.TierDisplayName,
                    CurrentEntities = client.CurrentEntities,
                    CurrentTemplates = client.CurrentTemplates,
                    CurrentUsers = client.CurrentUsers,
                    DiscussedMonthlyFee = client.DiscussedMonthlyFee,
                    ActualMonthlyFee = client.ActualMonthlyFee,
                    StartDate = client.StartDate,
                    EndDate = client.EndDate,
                    Status = client.Status,
                    IsActive = client.IsActive,
                    CreatedDate = client.CreatedDate,
                    ModifiedDate = client.ModifiedDate,
                    Notes = client.Notes,
                    ApplicationServerName = client.ApplicationServerName,
                    DatabaseServerName = client.DatabaseServerName
                };

                return Ok(clientDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching client", error = ex.Message });
            }
        }

        [HttpGet("server/{serverId}")]
        public async Task<IActionResult> GetClientsByServer(int serverId)
        {
            try
            {
                var clients = await _clientRepository.GetClientsByServerAsync(serverId);
                var clientDtos = clients.Select(c => new ClientDto
                {
                    ClientId = c.ClientId,
                    ClientName = c.ClientName,
                    CompanyName = c.CompanyName,
                    ContactEmail = c.ContactEmail,
                    ContactPhone = c.ContactPhone,
                    CurrentApplicationServerId = c.CurrentApplicationServerId,
                    CurrentDatabaseServerId = c.CurrentDatabaseServerId,
                    HostingType = c.HostingType,
                    TierId = c.TierId,
                    TierName = c.TierName,
                    TierDisplayName = c.TierDisplayName,
                    CurrentEntities = c.CurrentEntities,
                    CurrentTemplates = c.CurrentTemplates,
                    CurrentUsers = c.CurrentUsers,
                    DiscussedMonthlyFee = c.DiscussedMonthlyFee,
                    ActualMonthlyFee = c.ActualMonthlyFee,
                    StartDate = c.StartDate,
                    EndDate = c.EndDate,
                    Status = c.Status,
                    IsActive = c.IsActive,
                    CreatedDate = c.CreatedDate,
                    ModifiedDate = c.ModifiedDate,
                    Notes = c.Notes,
                    ApplicationServerName = c.ApplicationServerName,
                    DatabaseServerName = c.DatabaseServerName
                }).ToList();

                return Ok(clientDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching clients", error = ex.Message });
            }
        }

        [HttpGet("tier/{tierId}")]
        public async Task<IActionResult> GetClientsByTier(int tierId)
        {
            try
            {
                var clients = await _clientRepository.GetClientsByTierAsync(tierId);
                var clientDtos = clients.Select(c => new ClientDto
                {
                    ClientId = c.ClientId,
                    ClientName = c.ClientName,
                    CompanyName = c.CompanyName,
                    ContactEmail = c.ContactEmail,
                    ContactPhone = c.ContactPhone,
                    CurrentApplicationServerId = c.CurrentApplicationServerId,
                    CurrentDatabaseServerId = c.CurrentDatabaseServerId,
                    HostingType = c.HostingType,
                    TierId = c.TierId,
                    TierName = c.TierName,
                    TierDisplayName = c.TierDisplayName,
                    CurrentEntities = c.CurrentEntities,
                    CurrentTemplates = c.CurrentTemplates,
                    CurrentUsers = c.CurrentUsers,
                    DiscussedMonthlyFee = c.DiscussedMonthlyFee,
                    ActualMonthlyFee = c.ActualMonthlyFee,
                    StartDate = c.StartDate,
                    EndDate = c.EndDate,
                    Status = c.Status,
                    IsActive = c.IsActive,
                    CreatedDate = c.CreatedDate,
                    ModifiedDate = c.ModifiedDate,
                    Notes = c.Notes,
                    ApplicationServerName = c.ApplicationServerName,
                    DatabaseServerName = c.DatabaseServerName
                }).ToList();

                return Ok(clientDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching clients", error = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateClient([FromBody] CreateClientDto request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var client = await _clientRepository.CreateClientAsync(request, userId);

                var clientDto = new ClientDto
                {
                    ClientId = client.ClientId,
                    ClientName = client.ClientName,
                    CompanyName = client.CompanyName,
                    ContactEmail = client.ContactEmail,
                    ContactPhone = client.ContactPhone,
                    CurrentApplicationServerId = client.CurrentApplicationServerId,
                    CurrentDatabaseServerId = client.CurrentDatabaseServerId,
                    HostingType = client.HostingType,
                    TierId = client.TierId,
                    TierName = client.TierName,
                    TierDisplayName = client.TierDisplayName,
                    CurrentEntities = client.CurrentEntities,
                    CurrentTemplates = client.CurrentTemplates,
                    CurrentUsers = client.CurrentUsers,
                    DiscussedMonthlyFee = client.DiscussedMonthlyFee,
                    ActualMonthlyFee = client.ActualMonthlyFee,
                    StartDate = client.StartDate,
                    EndDate = client.EndDate,
                    Status = client.Status,
                    IsActive = client.IsActive,
                    CreatedDate = client.CreatedDate,
                    ModifiedDate = client.ModifiedDate,
                    Notes = client.Notes,
                    ApplicationServerName = client.ApplicationServerName,
                    DatabaseServerName = client.DatabaseServerName
                };

                return Ok(clientDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating client", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateClient(int id, [FromBody] UpdateClientDto request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var client = await _clientRepository.UpdateClientAsync(id, request, userId);

                if (client == null)
                {
                    return NotFound(new { message = "Client not found" });
                }

                var clientDto = new ClientDto
                {
                    ClientId = client.ClientId,
                    ClientName = client.ClientName,
                    CompanyName = client.CompanyName,
                    ContactEmail = client.ContactEmail,
                    ContactPhone = client.ContactPhone,
                    CurrentApplicationServerId = client.CurrentApplicationServerId,
                    CurrentDatabaseServerId = client.CurrentDatabaseServerId,
                    HostingType = client.HostingType,
                    TierId = client.TierId,
                    TierName = client.TierName,
                    TierDisplayName = client.TierDisplayName,
                    CurrentEntities = client.CurrentEntities,
                    CurrentTemplates = client.CurrentTemplates,
                    CurrentUsers = client.CurrentUsers,
                    DiscussedMonthlyFee = client.DiscussedMonthlyFee,
                    ActualMonthlyFee = client.ActualMonthlyFee,
                    StartDate = client.StartDate,
                    EndDate = client.EndDate,
                    Status = client.Status,
                    IsActive = client.IsActive,
                    CreatedDate = client.CreatedDate,
                    ModifiedDate = client.ModifiedDate,
                    Notes = client.Notes,
                    ApplicationServerName = client.ApplicationServerName,
                    DatabaseServerName = client.DatabaseServerName
                };

                return Ok(clientDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating client", error = ex.Message });
            }
        }

        [HttpPut("{id}/move")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> MoveClientToServer(int id, [FromBody] MoveClientToServerDto request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var client = await _clientRepository.MoveClientToServerAsync(id, request, userId);

                if (client == null)
                {
                    return NotFound(new { message = "Client not found" });
                }

                var clientDto = new ClientDto
                {
                    ClientId = client.ClientId,
                    ClientName = client.ClientName,
                    CompanyName = client.CompanyName,
                    ContactEmail = client.ContactEmail,
                    ContactPhone = client.ContactPhone,
                    CurrentApplicationServerId = client.CurrentApplicationServerId,
                    CurrentDatabaseServerId = client.CurrentDatabaseServerId,
                    HostingType = client.HostingType,
                    TierId = client.TierId,
                    TierName = client.TierName,
                    TierDisplayName = client.TierDisplayName,
                    CurrentEntities = client.CurrentEntities,
                    CurrentTemplates = client.CurrentTemplates,
                    CurrentUsers = client.CurrentUsers,
                    DiscussedMonthlyFee = client.DiscussedMonthlyFee,
                    ActualMonthlyFee = client.ActualMonthlyFee,
                    StartDate = client.StartDate,
                    EndDate = client.EndDate,
                    Status = client.Status,
                    IsActive = client.IsActive,
                    CreatedDate = client.CreatedDate,
                    ModifiedDate = client.ModifiedDate,
                    Notes = client.Notes,
                    ApplicationServerName = client.ApplicationServerName,
                    DatabaseServerName = client.DatabaseServerName
                };

                return Ok(clientDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while moving client", error = ex.Message });
            }
        }

        [HttpPut("{id}/usage")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateClientUsage(int id, [FromBody] UpdateClientUsageDto request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var client = await _clientRepository.UpdateClientUsageAsync(id, request, userId);

                if (client == null)
                {
                    return NotFound(new { message = "Client not found" });
                }

                var clientDto = new ClientDto
                {
                    ClientId = client.ClientId,
                    ClientName = client.ClientName,
                    CompanyName = client.CompanyName,
                    ContactEmail = client.ContactEmail,
                    ContactPhone = client.ContactPhone,
                    CurrentApplicationServerId = client.CurrentApplicationServerId,
                    CurrentDatabaseServerId = client.CurrentDatabaseServerId,
                    HostingType = client.HostingType,
                    TierId = client.TierId,
                    TierName = client.TierName,
                    TierDisplayName = client.TierDisplayName,
                    CurrentEntities = client.CurrentEntities,
                    CurrentTemplates = client.CurrentTemplates,
                    CurrentUsers = client.CurrentUsers,
                    DiscussedMonthlyFee = client.DiscussedMonthlyFee,
                    ActualMonthlyFee = client.ActualMonthlyFee,
                    StartDate = client.StartDate,
                    EndDate = client.EndDate,
                    Status = client.Status,
                    IsActive = client.IsActive,
                    CreatedDate = client.CreatedDate,
                    ModifiedDate = client.ModifiedDate,
                    Notes = client.Notes,
                    ApplicationServerName = client.ApplicationServerName,
                    DatabaseServerName = client.DatabaseServerName
                };

                return Ok(clientDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating client usage", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteClient(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _clientRepository.DeleteClientAsync(id, userId);
                return Ok(new { message = "Client deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting client", error = ex.Message });
            }
        }

        [HttpGet("{id}/history")]
        public async Task<IActionResult> GetClientHistory(int id)
        {
            try
            {
                var history = await _clientRepository.GetClientHistoryAsync(id);
                return Ok(history);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching client history", error = ex.Message });
            }
        }

        [HttpGet("statistics")]
        public async Task<IActionResult> GetClientStatistics()
        {
            try
            {
                var stats = await _clientRepository.GetClientStatisticsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching statistics", error = ex.Message });
            }
        }
    }
}
