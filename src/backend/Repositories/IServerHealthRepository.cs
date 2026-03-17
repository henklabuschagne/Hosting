using HostingPlatform.API.Models;

namespace HostingPlatform.API.Repositories
{
    public interface IServerHealthRepository
    {
        // Thresholds
        Task<ServerHealthThreshold?> GetThresholdsByServerIdAsync(int serverId);
        Task<ServerHealthThreshold> UpsertThresholdsAsync(int serverId, ServerHealthThreshold thresholds, int userId);
        
        // Metrics
        Task<ServerHealthMetric> InsertMetricAsync(ServerHealthMetric metric);
        Task<List<ServerHealthMetric>> GetLatestMetricsAsync(int? serverId = null);
        Task<List<ServerHealthMetric>> GetMetricHistoryAsync(int serverId, DateTime? startDate = null, DateTime? endDate = null, int maxRecords = 1000);
        
        // Alerts
        Task<List<ServerHealthAlert>> GetActiveAlertsAsync(int? serverId = null, string? severity = null);
        Task<ServerHealthAlert> AcknowledgeAlertAsync(long alertId, int userId);
        Task<ServerHealthAlert> ResolveAlertAsync(long alertId, int userId);
        
        // Analytics
        Task<ServerHealthAnalytics> GetAnalyticsAsync(int serverId, int daysBack = 7);
    }
}
