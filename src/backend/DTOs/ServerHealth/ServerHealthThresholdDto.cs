namespace HostingPlatform.API.DTOs.ServerHealth
{
    public class ServerHealthThresholdDto
    {
        public int ThresholdId { get; set; }
        public int ServerId { get; set; }
        
        // CPU Thresholds
        public decimal CPUWarningThreshold { get; set; }
        public decimal CPUCriticalThreshold { get; set; }
        
        // Memory Thresholds
        public decimal MemoryWarningThreshold { get; set; }
        public decimal MemoryCriticalThreshold { get; set; }
        
        // Disk Thresholds
        public decimal DiskWarningThreshold { get; set; }
        public decimal DiskCriticalThreshold { get; set; }
        
        // Health Check Configuration
        public string? HealthCheckUrl { get; set; }
        public bool HealthCheckEnabled { get; set; }
        public int CheckIntervalMinutes { get; set; }
        
        // Alert Configuration
        public bool EmailAlertsEnabled { get; set; }
        public string? AlertEmailAddresses { get; set; }
        
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
    }

    public class UpsertServerHealthThresholdDto
    {
        public decimal CPUWarningThreshold { get; set; } = 70.00m;
        public decimal CPUCriticalThreshold { get; set; } = 90.00m;
        
        public decimal MemoryWarningThreshold { get; set; } = 75.00m;
        public decimal MemoryCriticalThreshold { get; set; } = 90.00m;
        
        public decimal DiskWarningThreshold { get; set; } = 80.00m;
        public decimal DiskCriticalThreshold { get; set; } = 95.00m;
        
        public string? HealthCheckUrl { get; set; }
        public bool HealthCheckEnabled { get; set; } = true;
        public int CheckIntervalMinutes { get; set; } = 60;
        
        public bool EmailAlertsEnabled { get; set; } = true;
        public string? AlertEmailAddresses { get; set; }
    }
}
