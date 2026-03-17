using System.Data;
using Dapper;
using HostingPlatform.API.DTOs;

namespace HostingPlatform.API.Services;

public interface ITierService
{
    Task<IEnumerable<ServerTierDTO>> GetAllServerTiersAsync();
    Task<ServerTierDTO?> GetServerTierByIdAsync(int tierId);
    Task<ServerTierDTO> CreateServerTierAsync(CreateServerTierDTO createTier, int? createdBy = null);
    Task<ServerTierDTO> UpdateServerTierAsync(int tierId, UpdateServerTierDTO updateTier, int? updatedBy = null);
    Task<TierRecommendationResponseDTO> GetTierRecommendationAsync(TierRecommendationRequestDTO request);
}

public class TierService : ITierService
{
    private readonly IDbConnection _connection;

    public TierService(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<IEnumerable<ServerTierDTO>> GetAllServerTiersAsync()
    {
        return await _connection.QueryAsync<ServerTierDTO>(
            "sp_GetAllServerTiers",
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<ServerTierDTO?> GetServerTierByIdAsync(int tierId)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@TierId", tierId);

        return await _connection.QueryFirstOrDefaultAsync<ServerTierDTO>(
            "sp_GetServerTierById",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<ServerTierDTO> CreateServerTierAsync(CreateServerTierDTO createTier, int? createdBy = null)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@TierName", createTier.TierName);
        parameters.Add("@DisplayName", createTier.DisplayName);
        parameters.Add("@MaxEntities", createTier.MaxEntities);
        parameters.Add("@MaxTemplates", createTier.MaxTemplates);
        parameters.Add("@MaxUsers", createTier.MaxUsers);
        parameters.Add("@PricePerMonth", createTier.PricePerMonth);
        parameters.Add("@Description", createTier.Description);
        parameters.Add("@CreatedBy", createdBy);

        return await _connection.QueryFirstAsync<ServerTierDTO>(
            "sp_CreateServerTier",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<ServerTierDTO> UpdateServerTierAsync(int tierId, UpdateServerTierDTO updateTier, int? updatedBy = null)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@TierId", tierId);
        parameters.Add("@DisplayName", updateTier.DisplayName);
        parameters.Add("@MaxEntities", updateTier.MaxEntities);
        parameters.Add("@MaxTemplates", updateTier.MaxTemplates);
        parameters.Add("@MaxUsers", updateTier.MaxUsers);
        parameters.Add("@PricePerMonth", updateTier.PricePerMonth);
        parameters.Add("@Description", updateTier.Description);
        parameters.Add("@UpdatedBy", updatedBy);

        return await _connection.QueryFirstAsync<ServerTierDTO>(
            "sp_UpdateServerTier",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<TierRecommendationResponseDTO> GetTierRecommendationAsync(TierRecommendationRequestDTO request)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@RequestedEntities", request.RequestedEntities);
        parameters.Add("@RequestedTemplates", request.RequestedTemplates);
        parameters.Add("@RequestedUsers", request.RequestedUsers);

        return await _connection.QueryFirstAsync<TierRecommendationResponseDTO>(
            "sp_GetTierRecommendation",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }
}
