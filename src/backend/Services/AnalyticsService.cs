using System.Data;
using Dapper;
using HostingPlatform.API.DTOs;

namespace HostingPlatform.API.Services;

public interface IAnalyticsService
{
    Task<DashboardStatsDTO> GetDashboardStatsAsync();
    Task<IEnumerable<ServerUtilizationReportDTO>> GetServerUtilizationReportAsync();
    Task<IEnumerable<RevenueByTierDTO>> GetRevenueByTierAsync();
    Task<IEnumerable<ClientDistributionDTO>> GetClientDistributionAsync();
    Task<IEnumerable<TopClientDTO>> GetTopClientsByUsageAsync(int topN = 10);
}

public class AnalyticsService : IAnalyticsService
{
    private readonly IDbConnection _connection;

    public AnalyticsService(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<DashboardStatsDTO> GetDashboardStatsAsync()
    {
        return await _connection.QueryFirstAsync<DashboardStatsDTO>(
            "sp_GetDashboardStats",
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<IEnumerable<ServerUtilizationReportDTO>> GetServerUtilizationReportAsync()
    {
        return await _connection.QueryAsync<ServerUtilizationReportDTO>(
            "sp_GetServerUtilizationReport",
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<IEnumerable<RevenueByTierDTO>> GetRevenueByTierAsync()
    {
        return await _connection.QueryAsync<RevenueByTierDTO>(
            "sp_GetRevenueByTier",
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<IEnumerable<ClientDistributionDTO>> GetClientDistributionAsync()
    {
        return await _connection.QueryAsync<ClientDistributionDTO>(
            "sp_GetClientDistribution",
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<IEnumerable<TopClientDTO>> GetTopClientsByUsageAsync(int topN = 10)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@TopN", topN);

        return await _connection.QueryAsync<TopClientDTO>(
            "sp_GetTopClientsByUsage",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }
}
