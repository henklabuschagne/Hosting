using HostingPlatform.API.Models;
using HostingPlatform.API.DTOs.Servers;

namespace HostingPlatform.API.Repositories
{
    public interface IServerRepository
    {
        Task<List<Server>> GetAllServersAsync();
        Task<Server> GetServerByIdAsync(int serverId);
        Task<List<Server>> GetServersByTierAsync(int tierId);
        Task<List<Server>> GetServersByTypeAsync(string serverType);
        Task<List<AvailableServerDto>> GetAvailableServersAsync(int? tierId, string serverType, string hostingType);
        Task<Server> CreateServerAsync(CreateServerDto dto, int createdByUserId);
        Task<Server> UpdateServerAsync(int serverId, UpdateServerDto dto, int modifiedByUserId);
        Task<Server> UpdateServerLoadAsync(int serverId, UpdateServerLoadDto dto);
        Task<Server> UpdateServerStatusAsync(int serverId, string status, int modifiedByUserId);
        Task DeleteServerAsync(int serverId, int modifiedByUserId);
        Task<ServerStatisticsDto> GetServerStatisticsAsync();
        Task<ServerCapacitySummaryDto> GetServerCapacitySummaryAsync(int serverId);
    }
}
