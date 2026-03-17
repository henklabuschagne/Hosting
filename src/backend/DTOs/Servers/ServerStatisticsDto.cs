namespace HostingPlatform.API.DTOs.Servers
{
    public class ServerStatisticsDto
    {
        public int TotalServers { get; set; }
        public int ActiveServers { get; set; }
        public int MaintenanceServers { get; set; }
        public int InactiveServers { get; set; }
        public int ApplicationServers { get; set; }
        public int DatabaseServers { get; set; }
        public int SharedServers { get; set; }
        public int DedicatedServers { get; set; }
    }

    public class ServerCapacitySummaryDto
    {
        public int ServerId { get; set; }
        public string ServerName { get; set; }
        public string ServerType { get; set; }
        public int CurrentEntities { get; set; }
        public int CurrentTemplates { get; set; }
        public int CurrentUsers { get; set; }
        public int MaxEntities { get; set; }
        public int MaxTemplates { get; set; }
        public int MaxUsers { get; set; }
        public decimal EntitiesUsagePercent { get; set; }
        public decimal TemplatesUsagePercent { get; set; }
        public decimal UsersUsagePercent { get; set; }
    }

    public class AvailableServerDto
    {
        public int ServerId { get; set; }
        public string ServerName { get; set; }
        public int TierId { get; set; }
        public string TierName { get; set; }
        public string TierDisplayName { get; set; }
        public string ServerType { get; set; }
        public string HostingType { get; set; }
        public int CpuCores { get; set; }
        public int RamGB { get; set; }
        public int StorageGB { get; set; }
        public string Location { get; set; }
        public string IpAddress { get; set; }
        public int CurrentEntities { get; set; }
        public int CurrentTemplates { get; set; }
        public int CurrentUsers { get; set; }
        public string Status { get; set; }
        public int MaxEntities { get; set; }
        public int MaxTemplates { get; set; }
        public int MaxUsers { get; set; }
        public int AvailableEntities { get; set; }
        public int AvailableTemplates { get; set; }
        public int AvailableUsers { get; set; }
    }
}
