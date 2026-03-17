using System.Data;
using Microsoft.Data.SqlClient;
using Dapper;
using HostingPlatform.API.Models;
using HostingPlatform.API.DTOs.Clients;

namespace HostingPlatform.API.Repositories
{
    public class ClientRepository : IClientRepository
    {
        private readonly string _connectionString;

        public ClientRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        private IDbConnection CreateConnection()
        {
            return new SqlConnection(_connectionString);
        }

        public async Task<List<Client>> GetAllClientsAsync()
        {
            using var connection = CreateConnection();
            
            var clients = await connection.QueryAsync<Client>(
                "sp_GetAllClients",
                commandType: CommandType.StoredProcedure
            );

            return clients.ToList();
        }

        public async Task<Client> GetClientByIdAsync(int clientId)
        {
            using var connection = CreateConnection();
            var parameters = new { ClientId = clientId };
            
            var client = await connection.QueryFirstOrDefaultAsync<Client>(
                "sp_GetClientById",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return client;
        }

        public async Task<List<Client>> GetClientsByServerAsync(int serverId)
        {
            using var connection = CreateConnection();
            var parameters = new { ServerId = serverId };
            
            var clients = await connection.QueryAsync<Client>(
                "sp_GetClientsByServer",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return clients.ToList();
        }

        public async Task<List<Client>> GetClientsByTierAsync(int tierId)
        {
            using var connection = CreateConnection();
            var parameters = new { TierId = tierId };
            
            var clients = await connection.QueryAsync<Client>(
                "sp_GetClientsByTier",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return clients.ToList();
        }

        public async Task<Client> CreateClientAsync(CreateClientDto dto, int createdByUserId)
        {
            using var connection = CreateConnection();
            var parameters = new
            {
                ClientName = dto.ClientName,
                CompanyName = dto.CompanyName,
                ContactEmail = dto.ContactEmail,
                ContactPhone = dto.ContactPhone,
                CurrentApplicationServerId = dto.CurrentApplicationServerId,
                CurrentDatabaseServerId = dto.CurrentDatabaseServerId,
                HostingType = dto.HostingType,
                TierId = dto.TierId,
                CurrentEntities = dto.CurrentEntities,
                CurrentTemplates = dto.CurrentTemplates,
                CurrentUsers = dto.CurrentUsers,
                DiscussedMonthlyFee = dto.DiscussedMonthlyFee,
                ActualMonthlyFee = dto.ActualMonthlyFee,
                StartDate = dto.StartDate,
                Status = dto.Status ?? "active",
                Notes = dto.Notes,
                CreatedByUserId = createdByUserId
            };
            
            var client = await connection.QueryFirstOrDefaultAsync<Client>(
                "sp_CreateClient",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return client;
        }

        public async Task<Client> UpdateClientAsync(int clientId, UpdateClientDto dto, int modifiedByUserId)
        {
            using var connection = CreateConnection();
            var parameters = new
            {
                ClientId = clientId,
                ClientName = dto.ClientName,
                CompanyName = dto.CompanyName,
                ContactEmail = dto.ContactEmail,
                ContactPhone = dto.ContactPhone,
                DiscussedMonthlyFee = dto.DiscussedMonthlyFee,
                ActualMonthlyFee = dto.ActualMonthlyFee,
                Status = dto.Status,
                Notes = dto.Notes,
                ModifiedByUserId = modifiedByUserId
            };
            
            var client = await connection.QueryFirstOrDefaultAsync<Client>(
                "sp_UpdateClient",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return client;
        }

        public async Task<Client> MoveClientToServerAsync(int clientId, MoveClientToServerDto dto, int modifiedByUserId)
        {
            using var connection = CreateConnection();
            var parameters = new
            {
                ClientId = clientId,
                NewApplicationServerId = dto.NewApplicationServerId,
                NewDatabaseServerId = dto.NewDatabaseServerId,
                ChangeReason = dto.ChangeReason,
                ModifiedByUserId = modifiedByUserId
            };
            
            var client = await connection.QueryFirstOrDefaultAsync<Client>(
                "sp_MoveClientToServer",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return client;
        }

        public async Task<Client> UpdateClientUsageAsync(int clientId, UpdateClientUsageDto dto, int modifiedByUserId)
        {
            using var connection = CreateConnection();
            var parameters = new
            {
                ClientId = clientId,
                NewEntities = dto.CurrentEntities,
                NewTemplates = dto.CurrentTemplates,
                NewUsers = dto.CurrentUsers,
                ModifiedByUserId = modifiedByUserId
            };
            
            var client = await connection.QueryFirstOrDefaultAsync<Client>(
                "sp_UpdateClientUsage",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return client;
        }

        public async Task DeleteClientAsync(int clientId, int modifiedByUserId)
        {
            using var connection = CreateConnection();
            var parameters = new
            {
                ClientId = clientId,
                ModifiedByUserId = modifiedByUserId
            };
            
            await connection.ExecuteAsync(
                "sp_DeleteClient",
                parameters,
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<List<ClientHistoryDto>> GetClientHistoryAsync(int clientId)
        {
            using var connection = CreateConnection();
            var parameters = new { ClientId = clientId };
            
            var history = await connection.QueryAsync<ClientHistoryDto>(
                "sp_GetClientHistory",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return history.ToList();
        }

        public async Task<ClientStatisticsDto> GetClientStatisticsAsync()
        {
            using var connection = CreateConnection();
            
            var stats = await connection.QueryFirstOrDefaultAsync<ClientStatisticsDto>(
                "sp_GetClientStatistics",
                commandType: CommandType.StoredProcedure
            );

            return stats;
        }
    }
}
