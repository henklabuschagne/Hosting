using System.Data;
using Dapper;
using HostingPlatform.API.DTOs;

namespace HostingPlatform.API.Services;

public interface IRequestService
{
    Task<IEnumerable<TierRequestDTO>> GetAllTierRequestsAsync();
    Task<TierRequestDTO?> GetTierRequestByIdAsync(int requestId);
    Task<TierRequestDTO> CreateTierRequestAsync(CreateTierRequestDTO createRequest);
    Task<TierRequestDTO> UpdateTierRequestStatusAsync(int requestId, UpdateTierRequestStatusDTO updateStatus, int? reviewedBy = null);
    Task DeleteTierRequestAsync(int requestId, int? deletedBy = null);
}

public class RequestService : IRequestService
{
    private readonly IDbConnection _connection;

    public RequestService(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<IEnumerable<TierRequestDTO>> GetAllTierRequestsAsync()
    {
        return await _connection.QueryAsync<TierRequestDTO>(
            "sp_GetAllTierRequests",
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<TierRequestDTO?> GetTierRequestByIdAsync(int requestId)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@RequestId", requestId);

        return await _connection.QueryFirstOrDefaultAsync<TierRequestDTO>(
            "sp_GetTierRequestById",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<TierRequestDTO> CreateTierRequestAsync(CreateTierRequestDTO createRequest)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@CustomerName", createRequest.CustomerName);
        parameters.Add("@CustomerEmail", createRequest.CustomerEmail);
        parameters.Add("@RequestedEntities", createRequest.RequestedEntities);
        parameters.Add("@RequestedTemplates", createRequest.RequestedTemplates);
        parameters.Add("@RequestedUsers", createRequest.RequestedUsers);

        return await _connection.QueryFirstAsync<TierRequestDTO>(
            "sp_CreateTierRequest",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<TierRequestDTO> UpdateTierRequestStatusAsync(int requestId, UpdateTierRequestStatusDTO updateStatus, int? reviewedBy = null)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@RequestId", requestId);
        parameters.Add("@Status", updateStatus.Status);
        parameters.Add("@Notes", updateStatus.Notes);
        parameters.Add("@ReviewedBy", reviewedBy);

        return await _connection.QueryFirstAsync<TierRequestDTO>(
            "sp_UpdateTierRequestStatus",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task DeleteTierRequestAsync(int requestId, int? deletedBy = null)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@RequestId", requestId);
        parameters.Add("@DeletedBy", deletedBy);

        await _connection.ExecuteAsync(
            "sp_DeleteTierRequest",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }
}
