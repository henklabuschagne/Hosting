using System.Data;
using Dapper;
using HostingPlatform.API.DTOs;

namespace HostingPlatform.API.Services;

public interface IServerService
{
    Task<IEnumerable<ServerDTO>> GetAllServersAsync();
    Task<ServerDTO?> GetServerByIdAsync(int serverId);
    Task<ServerDTO> CreateServerAsync(CreateServerDTO createServer, int? createdBy = null);
    Task<ServerDTO> UpdateServerAsync(int serverId, UpdateServerDTO updateServer, int? updatedBy = null);
    Task DeleteServerAsync(int serverId, int? deletedBy = null);
    Task<IEnumerable<ClientDTO>> GetServerClientsAsync(int serverId);
    Task<ServerCapacityDTO> GetServerCapacityAsync(int serverId);
    Task AssignClientToServerAsync(int clientId, int serverId, int? assignedBy = null);
    Task UnassignClientFromServerAsync(int clientId, int serverId, int? unassignedBy = null);
}

public class ServerService : IServerService
{
    private readonly IDbConnection _connection;

    public ServerService(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<IEnumerable<ServerDTO>> GetAllServersAsync()
    {
        return await _connection.QueryAsync<ServerDTO>(
            "sp_GetAllServers",
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<ServerDTO?> GetServerByIdAsync(int serverId)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@ServerId", serverId);

        return await _connection.QueryFirstOrDefaultAsync<ServerDTO>(
            "sp_GetServerById",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<ServerDTO> CreateServerAsync(CreateServerDTO createServer, int? createdBy = null)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@ServerName", createServer.ServerName);
        parameters.Add("@ServerType", createServer.ServerType);
        parameters.Add("@TierId", createServer.TierId);
        parameters.Add("@MaxEntities", createServer.MaxEntities);
        parameters.Add("@MaxTemplates", createServer.MaxTemplates);
        parameters.Add("@MaxUsers", createServer.MaxUsers);
        parameters.Add("@IPAddress", createServer.IPAddress);
        parameters.Add("@Location", createServer.Location);
        parameters.Add("@Status", createServer.Status);
        parameters.Add("@Notes", createServer.Notes);
        parameters.Add("@CreatedBy", createdBy);

        return await _connection.QueryFirstAsync<ServerDTO>(
            "sp_CreateServer",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<ServerDTO> UpdateServerAsync(int serverId, UpdateServerDTO updateServer, int? updatedBy = null)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@ServerId", serverId);
        parameters.Add("@ServerName", updateServer.ServerName);
        parameters.Add("@ServerType", updateServer.ServerType);
        parameters.Add("@TierId", updateServer.TierId);
        parameters.Add("@MaxEntities", updateServer.MaxEntities);
        parameters.Add("@MaxTemplates", updateServer.MaxTemplates);
        parameters.Add("@MaxUsers", updateServer.MaxUsers);
        parameters.Add("@IPAddress", updateServer.IPAddress);
        parameters.Add("@Location", updateServer.Location);
        parameters.Add("@Status", updateServer.Status);
        parameters.Add("@Notes", updateServer.Notes);
        parameters.Add("@UpdatedBy", updatedBy);

        return await _connection.QueryFirstAsync<ServerDTO>(
            "sp_UpdateServer",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task DeleteServerAsync(int serverId, int? deletedBy = null)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@ServerId", serverId);
        parameters.Add("@DeletedBy", deletedBy);

        await _connection.ExecuteAsync(
            "sp_DeleteServer",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<IEnumerable<ClientDTO>> GetServerClientsAsync(int serverId)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@ServerId", serverId);

        return await _connection.QueryAsync<ClientDTO>(
            "sp_GetServerClients",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<ServerCapacityDTO> GetServerCapacityAsync(int serverId)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@ServerId", serverId);

        return await _connection.QueryFirstAsync<ServerCapacityDTO>(
            "sp_GetServerCapacity",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task AssignClientToServerAsync(int clientId, int serverId, int? assignedBy = null)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@ClientId", clientId);
        parameters.Add("@ServerId", serverId);
        parameters.Add("@AssignedBy", assignedBy);

        await _connection.ExecuteAsync(
            "sp_AssignClientToServer",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task UnassignClientFromServerAsync(int clientId, int serverId, int? unassignedBy = null)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@ClientId", clientId);
        parameters.Add("@ServerId", serverId);
        parameters.Add("@UnassignedBy", unassignedBy);

        await _connection.ExecuteAsync(
            "sp_UnassignClientFromServer",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }
}
