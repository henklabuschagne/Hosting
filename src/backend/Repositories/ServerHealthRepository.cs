using System.Data;
using Microsoft.Data.SqlClient;
using Dapper;
using HostingPlatform.API.Models;
using HostingPlatform.API.Services;
using Microsoft.Extensions.Logging;

namespace HostingPlatform.API.Repositories
{
    public class ServerHealthRepository : IServerHealthRepository
    {
        private readonly string _connectionString;
        private readonly IEmailNotificationService _emailService;
        private readonly ILogger<ServerHealthRepository> _logger;

        public ServerHealthRepository(
            IConfiguration configuration,
            IEmailNotificationService emailService,
            ILogger<ServerHealthRepository> logger)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new InvalidOperationException("Connection string not found");
            _emailService = emailService;
            _logger = logger;
        }

        private IDbConnection CreateConnection()
        {
            return new SqlConnection(_connectionString);
        }

        public async Task<ServerHealthThreshold?> GetThresholdsByServerIdAsync(int serverId)
        {
            using var connection = CreateConnection();
            var parameters = new { ServerId = serverId };
            
            var threshold = await connection.QueryFirstOrDefaultAsync<ServerHealthThreshold>(
                "sp_GetServerHealthThresholds",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return threshold;
        }

        public async Task<ServerHealthThreshold> UpsertThresholdsAsync(int serverId, ServerHealthThreshold thresholds, int userId)
        {
            using var connection = CreateConnection();
            var parameters = new
            {
                ServerId = serverId,
                thresholds.CPUWarningThreshold,
                thresholds.CPUCriticalThreshold,
                thresholds.MemoryWarningThreshold,
                thresholds.MemoryCriticalThreshold,
                thresholds.DiskWarningThreshold,
                thresholds.DiskCriticalThreshold,
                thresholds.HealthCheckUrl,
                thresholds.HealthCheckEnabled,
                thresholds.CheckIntervalMinutes,
                thresholds.EmailAlertsEnabled,
                thresholds.AlertEmailAddresses,
                UserId = userId
            };
            
            var result = await connection.QueryFirstOrDefaultAsync<ServerHealthThreshold>(
                "sp_UpsertServerHealthThresholds",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return result ?? thresholds;
        }

        public async Task<ServerHealthMetric> InsertMetricAsync(ServerHealthMetric metric)
        {
            using var connection = CreateConnection();
            var parameters = new
            {
                metric.ServerId,
                metric.CPUUsagePercent,
                metric.MemoryUsagePercent,
                metric.MemoryUsedGB,
                metric.MemoryTotalGB,
                metric.DiskUsagePercent,
                metric.DiskUsedGB,
                metric.DiskTotalGB,
                metric.NetworkInMbps,
                metric.NetworkOutMbps,
                metric.UptimeDays,
                metric.ActiveConnections,
                metric.ResponseTimeMs,
                metric.IsReachable,
                metric.ErrorMessage
            };
            
            var result = await connection.QueryFirstOrDefaultAsync<ServerHealthMetric>(
                "sp_InsertServerHealthMetrics",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return result ?? metric;
        }

        public async Task<List<ServerHealthMetric>> GetLatestMetricsAsync(int? serverId = null)
        {
            using var connection = CreateConnection();
            var parameters = new { ServerId = serverId };
            
            var metrics = await connection.QueryAsync<ServerHealthMetric>(
                "sp_GetLatestServerHealthMetrics",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return metrics.ToList();
        }

        public async Task<List<ServerHealthMetric>> GetMetricHistoryAsync(int serverId, DateTime? startDate = null, DateTime? endDate = null, int maxRecords = 1000)
        {
            using var connection = CreateConnection();
            var parameters = new
            {
                ServerId = serverId,
                StartDate = startDate,
                EndDate = endDate,
                MaxRecords = maxRecords
            };
            
            var metrics = await connection.QueryAsync<ServerHealthMetric>(
                "sp_GetServerHealthHistory",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return metrics.ToList();
        }

        public async Task<List<ServerHealthAlert>> GetActiveAlertsAsync(int? serverId = null, string? severity = null)
        {
            using var connection = CreateConnection();
            var parameters = new
            {
                ServerId = serverId,
                Severity = severity
            };
            
            var alerts = await connection.QueryAsync<ServerHealthAlert>(
                "sp_GetActiveHealthAlerts",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return alerts.ToList();
        }

        public async Task<ServerHealthAlert> AcknowledgeAlertAsync(long alertId, int userId)
        {
            using var connection = CreateConnection();
            var parameters = new
            {
                AlertId = alertId,
                UserId = userId
            };
            
            var alert = await connection.QueryFirstOrDefaultAsync<ServerHealthAlert>(
                "sp_AcknowledgeHealthAlert",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return alert ?? new ServerHealthAlert();
        }

        public async Task<ServerHealthAlert> ResolveAlertAsync(long alertId, int userId)
        {
            using var connection = CreateConnection();
            var parameters = new
            {
                AlertId = alertId,
                UserId = userId
            };
            
            var alert = await connection.QueryFirstOrDefaultAsync<ServerHealthAlert>(
                "sp_ResolveHealthAlert",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return alert ?? new ServerHealthAlert();
        }

        public async Task<ServerHealthAnalytics> GetAnalyticsAsync(int serverId, int daysBack = 7)
        {
            using var connection = CreateConnection();
            var parameters = new
            {
                ServerId = serverId,
                DaysBack = daysBack
            };
            
            var analytics = await connection.QueryFirstOrDefaultAsync<ServerHealthAnalytics>(
                "sp_GetServerHealthAnalytics",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return analytics ?? new ServerHealthAnalytics();
        }
    }
}