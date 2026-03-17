namespace HostingPlatform.API.DTOs.ServerHealth
{
    public class ServerHealthAlertDto
    {
        public long AlertId { get; set; }
        public int ServerId { get; set; }
        public string? ServerName { get; set; }
        public string? ServerType { get; set; }
        
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

    public class ServerHealthAnalyticsDto
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
