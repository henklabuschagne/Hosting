using System.Data;
using Microsoft.Data.SqlClient;
using Dapper;
using HostingPlatform.API.Models;
using HostingPlatform.API.DTOs.Servers;

namespace HostingPlatform.API.Repositories
{
    public class ServerRepository : IServerRepository
    {
        private readonly string _connectionString;

        public ServerRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        private IDbConnection CreateConnection()
        {
            return new SqlConnection(_connectionString);
        }

        public async Task<List<Server>> GetAllServersAsync()
        {
            using var connection = CreateConnection();
            
            var servers = await connection.QueryAsync<Server>(
                "sp_GetAllServers",
                commandType: CommandType.StoredProcedure
            );

            return servers.ToList();
        }

        public async Task<Server> GetServerByIdAsync(int serverId)
        {
            using var connection = CreateConnection();
            var parameters = new { ServerId = serverId };
            
            var server = await connection.QueryFirstOrDefaultAsync<Server>(
                "sp_GetServerById",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return server;
        }

        public async Task<List<Server>> GetServersByTierAsync(int tierId)
        {
            using var connection = CreateConnection();
            var parameters = new { TierId = tierId };
            
            var servers = await connection.QueryAsync<Server>(
                "sp_GetServersByTier",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return servers.ToList();
        }

        public async Task<List<Server>> GetServersByTypeAsync(string serverType)
        {
            using var connection = CreateConnection();
            var parameters = new { ServerType = serverType };
            
            var servers = await connection.QueryAsync<Server>(
                "sp_GetServersByType",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return servers.ToList();
        }

        public async Task<List<AvailableServerDto>> GetAvailableServersAsync(int? tierId, string serverType, string hostingType)
        {
            using var connection = CreateConnection();
            var parameters = new 
            { 
                TierId = tierId,
                ServerType = serverType,
                HostingType = hostingType
            };
            
            var servers = await connection.QueryAsync<AvailableServerDto>(
                "sp_GetAvailableServers",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return servers.ToList();
        }

        public async Task<Server> CreateServerAsync(CreateServerDto dto, int createdByUserId)
        {
            using var connection = CreateConnection();
            var parameters = new
            {
                ServerName = dto.ServerName,
                TierId = dto.TierId,
                ServerType = dto.ServerType,
                HostingType = dto.HostingType,
                CpuCores = dto.CpuCores,
                RamGB = dto.RamGB,
                StorageGB = dto.StorageGB,
                Location = dto.Location,
                IpAddress = dto.IpAddress,
                Status = dto.Status ?? "active",
                Notes = dto.Notes,
                CreatedByUserId = createdByUserId
            };
            
            var server = await connection.QueryFirstOrDefaultAsync<Server>(
                "sp_CreateServer",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return server;
        }

        public async Task<Server> UpdateServerAsync(int serverId, UpdateServerDto dto, int modifiedByUserId)
        {
            using var connection = CreateConnection();
            var parameters = new
            {
                ServerId = serverId,
                ServerName = dto.ServerName,
                Location = dto.Location,
                IpAddress = dto.IpAddress,
                Status = dto.Status,
                Notes = dto.Notes,
                ModifiedByUserId = modifiedByUserId
            };
            
            var server = await connection.QueryFirstOrDefaultAsync<Server>(
                "sp_UpdateServer",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return server;
        }

        public async Task<Server> UpdateServerLoadAsync(int serverId, UpdateServerLoadDto dto)
        {
            using var connection = CreateConnection();
            var parameters = new
            {
                ServerId = serverId,
                CurrentEntities = dto.CurrentEntities,
                CurrentTemplates = dto.CurrentTemplates,
                CurrentUsers = dto.CurrentUsers
            };
            
            var server = await connection.QueryFirstOrDefaultAsync<Server>(
                "sp_UpdateServerLoad",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return server;
        }

        public async Task<Server> UpdateServerStatusAsync(int serverId, string status, int modifiedByUserId)
        {
            using var connection = CreateConnection();
            var parameters = new
            {
                ServerId = serverId,
                Status = status,
                ModifiedByUserId = modifiedByUserId
            };
            
            var server = await connection.QueryFirstOrDefaultAsync<Server>(
                "sp_UpdateServerStatus",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return server;
        }

        public async Task DeleteServerAsync(int serverId, int modifiedByUserId)
        {
            using var connection = CreateConnection();
            var parameters = new
            {
                ServerId = serverId,
                ModifiedByUserId = modifiedByUserId
            };
            
            await connection.ExecuteAsync(
                "sp_DeleteServer",
                parameters,
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<ServerStatisticsDto> GetServerStatisticsAsync()
        {
            using var connection = CreateConnection();
            
            var stats = await connection.QueryFirstOrDefaultAsync<ServerStatisticsDto>(
                "sp_GetServerStatistics",
                commandType: CommandType.StoredProcedure
            );

            return stats;
        }

        public async Task<ServerCapacitySummaryDto> GetServerCapacitySummaryAsync(int serverId)
        {
            using var connection = CreateConnection();
            var parameters = new { ServerId = serverId };
            
            var summary = await connection.QueryFirstOrDefaultAsync<ServerCapacitySummaryDto>(
                "sp_GetServerCapacitySummary",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return summary;
        }
    }
}
