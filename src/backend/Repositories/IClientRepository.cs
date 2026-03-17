using HostingPlatform.API.Models;
using HostingPlatform.API.DTOs.Clients;

namespace HostingPlatform.API.Repositories
{
    public interface IClientRepository
    {
        Task<List<Client>> GetAllClientsAsync();
        Task<Client> GetClientByIdAsync(int clientId);
        Task<List<Client>> GetClientsByServerAsync(int serverId);
        Task<List<Client>> GetClientsByTierAsync(int tierId);
        Task<Client> CreateClientAsync(CreateClientDto dto, int createdByUserId);
        Task<Client> UpdateClientAsync(int clientId, UpdateClientDto dto, int modifiedByUserId);
        Task<Client> MoveClientToServerAsync(int clientId, MoveClientToServerDto dto, int modifiedByUserId);
        Task<Client> UpdateClientUsageAsync(int clientId, UpdateClientUsageDto dto, int modifiedByUserId);
        Task DeleteClientAsync(int clientId, int modifiedByUserId);
        Task<List<ClientHistoryDto>> GetClientHistoryAsync(int clientId);
        Task<ClientStatisticsDto> GetClientStatisticsAsync();
    }
}
