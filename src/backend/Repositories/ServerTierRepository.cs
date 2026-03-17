using System.Data;
using Microsoft.Data.SqlClient;
using Dapper;
using HostingPlatform.API.Models;

namespace HostingPlatform.API.Repositories
{
    public class ServerTierRepository : IServerTierRepository
    {
        private readonly string _connectionString;

        public ServerTierRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        private IDbConnection CreateConnection()
        {
            return new SqlConnection(_connectionString);
        }

        public async Task<List<ServerTier>> GetAllServerTiersAsync()
        {
            using var connection = CreateConnection();
            
            var tiers = await connection.QueryAsync<ServerTier>(
                "sp_GetAllServerTiers",
                commandType: CommandType.StoredProcedure
            );

            return tiers.ToList();
        }

        public async Task<ServerTier> GetServerTierByIdAsync(int tierId)
        {
            using var connection = CreateConnection();
            var parameters = new { TierId = tierId };
            
            var tier = await connection.QueryFirstOrDefaultAsync<ServerTier>(
                "sp_GetServerTierById",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return tier;
        }

        public async Task<ServerTier> GetServerTierByNameAsync(string tierName)
        {
            using var connection = CreateConnection();
            var parameters = new { TierName = tierName };
            
            var tier = await connection.QueryFirstOrDefaultAsync<ServerTier>(
                "sp_GetServerTierByName",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return tier;
        }

        public async Task<List<ServerTierSpec>> GetTierSpecsByTierIdAsync(int tierId)
        {
            using var connection = CreateConnection();
            var parameters = new { TierId = tierId };
            
            var specs = await connection.QueryAsync<ServerTierSpec>(
                "sp_GetTierSpecsByTierId",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return specs.ToList();
        }

        public async Task<Dictionary<int, List<ServerTierSpec>>> GetAllTierSpecsAsync()
        {
            using var connection = CreateConnection();
            
            using var multi = await connection.QueryMultipleAsync(
                "sp_GetAllTierConfigurations",
                commandType: CommandType.StoredProcedure
            );

            var tiers = (await multi.ReadAsync<ServerTier>()).ToList();
            var specs = (await multi.ReadAsync<ServerTierSpec>()).ToList();

            var result = new Dictionary<int, List<ServerTierSpec>>();
            foreach (var tier in tiers)
            {
                result[tier.TierId] = specs.Where(s => s.TierId == tier.TierId).ToList();
            }

            return result;
        }

        public async Task<ServerTierSpec> UpdateTierSpecAsync(int specId, ServerTierSpec spec)
        {
            using var connection = CreateConnection();
            var parameters = new
            {
                SpecId = specId,
                spec.CpuCores,
                spec.RamGB,
                spec.StorageGB,
                spec.BackupEnabled,
                spec.BackupFrequency,
                spec.BackupRetentionDays,
                spec.BandwidthMbps,
                spec.PublicIpIncluded,
                spec.MaxEntities,
                spec.MaxTemplates,
                spec.MaxUsers,
                spec.MonthlyPrice
            };
            
            var updatedSpec = await connection.QueryFirstOrDefaultAsync<ServerTierSpec>(
                "sp_UpdateTierSpec",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return updatedSpec;
        }

        public async Task<ServerTier> CreateServerTierAsync(string tierName, string displayName, string description, int createdByUserId)
        {
            using var connection = CreateConnection();
            var parameters = new
            {
                TierName = tierName,
                DisplayName = displayName,
                Description = description,
                CreatedByUserId = createdByUserId
            };
            
            var tier = await connection.QueryFirstOrDefaultAsync<ServerTier>(
                "sp_CreateServerTier",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return tier;
        }

        public async Task<ServerTier> UpdateServerTierAsync(int tierId, string displayName, string description, int modifiedByUserId)
        {
            using var connection = CreateConnection();
            var parameters = new
            {
                TierId = tierId,
                DisplayName = displayName,
                Description = description,
                ModifiedByUserId = modifiedByUserId
            };
            
            var tier = await connection.QueryFirstOrDefaultAsync<ServerTier>(
                "sp_UpdateServerTier",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return tier;
        }

        public async Task<ServerTierSpec> CreateTierSpecAsync(ServerTierSpec spec)
        {
            using var connection = CreateConnection();
            var parameters = new
            {
                spec.TierId,
                spec.ServerType,
                spec.CpuCores,
                spec.RamGB,
                spec.StorageGB,
                spec.BackupEnabled,
                spec.BackupFrequency,
                spec.BackupRetentionDays,
                spec.BandwidthMbps,
                spec.PublicIpIncluded,
                spec.MaxEntities,
                spec.MaxTemplates,
                spec.MaxUsers,
                spec.MonthlyPrice
            };
            
            var createdSpec = await connection.QueryFirstOrDefaultAsync<ServerTierSpec>(
                "sp_CreateTierSpec",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return createdSpec;
        }

        public async Task<RecommendedTier> GetRecommendedTierAsync(int requiredEntities, int requiredTemplates, int requiredUsers)
        {
            using var connection = CreateConnection();
            var parameters = new
            {
                RequiredEntities = requiredEntities,
                RequiredTemplates = requiredTemplates,
                RequiredUsers = requiredUsers
            };
            
            var recommendedTier = await connection.QueryFirstOrDefaultAsync<RecommendedTier>(
                "sp_GetRecommendedTier",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return recommendedTier;
        }

        public async Task DeleteServerTierAsync(int tierId, int modifiedByUserId)
        {
            using var connection = CreateConnection();
            var parameters = new
            {
                TierId = tierId,
                ModifiedByUserId = modifiedByUserId
            };
            
            await connection.ExecuteAsync(
                "sp_DeleteServerTier",
                parameters,
                commandType: CommandType.StoredProcedure
            );
        }
    }
}
