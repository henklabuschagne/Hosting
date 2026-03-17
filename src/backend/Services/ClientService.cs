using System.Data;
using Dapper;
using HostingPlatform.API.DTOs;

namespace HostingPlatform.API.Services;

public interface IClientService
{
    Task<IEnumerable<ClientDTO>> GetAllClientsAsync();
    Task<ClientDTO?> GetClientByIdAsync(int clientId);
    Task<ClientDTO> CreateClientAsync(CreateClientDTO createClient, int? createdBy = null);
    Task<ClientDTO> UpdateClientAsync(int clientId, UpdateClientDTO updateClient, int? updatedBy = null);
    Task DeleteClientAsync(int clientId, int? deletedBy = null);
    Task<IEnumerable<ServerDTO>> GetClientServersAsync(int clientId);
    Task<IEnumerable<ClientHostingHistoryDTO>> GetClientHostingHistoryAsync(int clientId);
}

public class ClientService : IClientService
{
    private readonly IDbConnection _connection;

    public ClientService(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<IEnumerable<ClientDTO>> GetAllClientsAsync()
    {
        return await _connection.QueryAsync<ClientDTO>(
            "sp_GetAllClients",
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<ClientDTO?> GetClientByIdAsync(int clientId)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@ClientId", clientId);

        return await _connection.QueryFirstOrDefaultAsync<ClientDTO>(
            "sp_GetClientById",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<ClientDTO> CreateClientAsync(CreateClientDTO createClient, int? createdBy = null)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@ClientName", createClient.ClientName);
        parameters.Add("@TierId", createClient.TierId);
        parameters.Add("@HostingType", createClient.HostingType);
        parameters.Add("@CurrentEntities", createClient.CurrentEntities);
        parameters.Add("@CurrentTemplates", createClient.CurrentTemplates);
        parameters.Add("@CurrentUsers", createClient.CurrentUsers);
        parameters.Add("@DiscussedMonthlyFee", createClient.DiscussedMonthlyFee);
        parameters.Add("@ActualMonthlyFee", createClient.ActualMonthlyFee);
        parameters.Add("@Status", createClient.Status);
        parameters.Add("@ContactEmail", createClient.ContactEmail);
        parameters.Add("@ContactPhone", createClient.ContactPhone);
        parameters.Add("@Notes", createClient.Notes);
        parameters.Add("@CreatedBy", createdBy);

        return await _connection.QueryFirstAsync<ClientDTO>(
            "sp_CreateClient",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<ClientDTO> UpdateClientAsync(int clientId, UpdateClientDTO updateClient, int? updatedBy = null)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@ClientId", clientId);
        parameters.Add("@ClientName", updateClient.ClientName);
        parameters.Add("@TierId", updateClient.TierId);
        parameters.Add("@HostingType", updateClient.HostingType);
        parameters.Add("@CurrentEntities", updateClient.CurrentEntities);
        parameters.Add("@CurrentTemplates", updateClient.CurrentTemplates);
        parameters.Add("@CurrentUsers", updateClient.CurrentUsers);
        parameters.Add("@DiscussedMonthlyFee", updateClient.DiscussedMonthlyFee);
        parameters.Add("@ActualMonthlyFee", updateClient.ActualMonthlyFee);
        parameters.Add("@Status", updateClient.Status);
        parameters.Add("@ContactEmail", updateClient.ContactEmail);
        parameters.Add("@ContactPhone", updateClient.ContactPhone);
        parameters.Add("@Notes", updateClient.Notes);
        parameters.Add("@UpdatedBy", updatedBy);

        return await _connection.QueryFirstAsync<ClientDTO>(
            "sp_UpdateClient",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task DeleteClientAsync(int clientId, int? deletedBy = null)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@ClientId", clientId);
        parameters.Add("@DeletedBy", deletedBy);

        await _connection.ExecuteAsync(
            "sp_DeleteClient",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<IEnumerable<ServerDTO>> GetClientServersAsync(int clientId)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@ClientId", clientId);

        return await _connection.QueryAsync<ServerDTO>(
            "sp_GetClientServers",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<IEnumerable<ClientHostingHistoryDTO>> GetClientHostingHistoryAsync(int clientId)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@ClientId", clientId);

        return await _connection.QueryAsync<ClientHostingHistoryDTO>(
            "sp_GetClientHostingHistory",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }
}
