namespace HostingPlatform.API.DTOs.ServerHealth
{
    public class ServerHealthMetricDto
    {
        public long MetricId { get; set; }
        public int ServerId { get; set; }
        public string? ServerName { get; set; }
        public string? ServerType { get; set; }
        
        // Resource Usage
        public decimal CPUUsagePercent { get; set; }
        public decimal MemoryUsagePercent { get; set; }
        public decimal MemoryUsedGB { get; set; }
        public decimal MemoryTotalGB { get; set; }
        public decimal DiskUsagePercent { get; set; }
        public decimal DiskUsedGB { get; set; }
        public decimal DiskTotalGB { get; set; }
        
        // Network Stats
        public decimal? NetworkInMbps { get; set; }
        public decimal? NetworkOutMbps { get; set; }
        
        // System Info
        public decimal? UptimeDays { get; set; }
        public int? ActiveConnections { get; set; }
        
        // Health Status
        public string HealthStatus { get; set; } = "Healthy";
        public int? ResponseTimeMs { get; set; }
        public bool IsReachable { get; set; }
        public string? ErrorMessage { get; set; }
        
        public DateTime RecordedAt { get; set; }
    }

    public class CreateServerHealthMetricDto
    {
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
        
        public int? ResponseTimeMs { get; set; }
        public bool IsReachable { get; set; } = true;
        public string? ErrorMessage { get; set; }
    }

    // Response from external health API
    public class ExternalHealthResponseDto
    {
        public decimal CpuUsage { get; set; }
        public decimal MemoryUsage { get; set; }
        public decimal MemoryUsedGB { get; set; }
        public decimal MemoryTotalGB { get; set; }
        public decimal DiskUsage { get; set; }
        public decimal DiskUsedGB { get; set; }
        public decimal DiskTotalGB { get; set; }
        public decimal? NetworkInMbps { get; set; }
        public decimal? NetworkOutMbps { get; set; }
        public decimal? UptimeDays { get; set; }
        public int? ActiveConnections { get; set; }
        public string Status { get; set; } = "OK";
    }
}
