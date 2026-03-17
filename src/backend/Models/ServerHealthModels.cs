namespace HostingPlatform.API.Models
{
    public class ServerHealthThreshold
    {
        public int ThresholdId { get; set; }
        public int ServerId { get; set; }
        
        public decimal CPUWarningThreshold { get; set; }
        public decimal CPUCriticalThreshold { get; set; }
        public decimal MemoryWarningThreshold { get; set; }
        public decimal MemoryCriticalThreshold { get; set; }
        public decimal DiskWarningThreshold { get; set; }
        public decimal DiskCriticalThreshold { get; set; }
        
        public string? HealthCheckUrl { get; set; }
        public bool HealthCheckEnabled { get; set; }
        public int CheckIntervalMinutes { get; set; }
        
        public bool EmailAlertsEnabled { get; set; }
        public string? AlertEmailAddresses { get; set; }
        
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public int? CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
    }

    public class ServerHealthMetric
    {
        public long MetricId { get; set; }
        public int ServerId { get; set; }
        public string? ServerName { get; set; }
        public string? ServerType { get; set; }
        
        public decimal CPUUsagePercent { get; set; }
        public decimal MemoryUsagePercent { get; set; }
        public decimal MemoryUsedGB { get; set; }
        public decimal MemoryTotalGB { get; set; }
        public decimal DiskUsagePercent { get; set; }
        public decimal DiskUsedGB { get; set; }
        public decimal DiskTotalGB { get; set; }
        
        public decimal? NetworkInMbps { get; set; }
        public decimal? NetworkOutMbps { get; set; }
        public decimal? UptimeDays { get; set; }
        public int? ActiveConnections { get; set; }
        
        public string HealthStatus { get; set; } = "Healthy";
        public int? ResponseTimeMs { get; set; }
        public bool IsReachable { get; set; }
        public string? ErrorMessage { get; set; }
        
        public DateTime RecordedAt { get; set; }
    }

    public class ServerHealthAlert
    {
        public long AlertId { get; set; }
        public int ServerId { get; set; }
        public string? ServerName { get; set; }
        public string? ServerType { get; set; }
        public long? MetricId { get; set; }
        
        public string AlertType { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        
        public string MetricName { get; set; } = string.Empty;
        public decimal CurrentValue { get; set; }
        public decimal ThresholdValue { get; set; }
        
        public string Status { get; set; } = "Active";
        public bool EmailSent { get; set; }
        public DateTime? EmailSentAt { get; set; }
        
        public DateTime? AcknowledgedAt { get; set; }
        public int? AcknowledgedBy { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public int? ResolvedBy { get; set; }
        
        public DateTime CreatedAt { get; set; }
    }

    public class ServerHealthAnalytics
    {
        public decimal AvgCPU { get; set; }
        public decimal AvgMemory { get; set; }
        public decimal AvgDisk { get; set; }
        
        public decimal PeakCPU { get; set; }
        public decimal PeakMemory { get; set; }
        public decimal PeakDisk { get; set; }
        
        public decimal MinCPU { get; set; }
        public decimal MinMemory { get; set; }
        public decimal MinDisk { get; set; }
        
        public int TotalReadings { get; set; }
        public int CriticalCount { get; set; }
        public int WarningCount { get; set; }
        public int HealthyCount { get; set; }
        public int OfflineCount { get; set; }
        
        public decimal UptimePercentage { get; set; }
    }
}
