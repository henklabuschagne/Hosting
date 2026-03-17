namespace HostingPlatform.API.DTOs;

public class DashboardStatsDTO
{
    public int TotalClients { get; set; }
    public int ActiveClients { get; set; }
    public int SuspendedClients { get; set; }
    public int TotalServers { get; set; }
    public int ActiveServers { get; set; }
    public decimal TotalRevenue { get; set; }
    public int PendingRequests { get; set; }
}

public class ServerUtilizationReportDTO
{
    public int ServerId { get; set; }
    public string ServerName { get; set; } = string.Empty;
    public string ServerType { get; set; } = string.Empty;
    public string TierName { get; set; } = string.Empty;
    public int ActiveClients { get; set; }
    public int MaxEntities { get; set; }
    public int UsedEntities { get; set; }
    public int AvailableEntities { get; set; }
    public decimal EntitiesUtilization { get; set; }
    public int MaxTemplates { get; set; }
    public int UsedTemplates { get; set; }
    public int AvailableTemplates { get; set; }
    public decimal TemplatesUtilization { get; set; }
    public int MaxUsers { get; set; }
    public int UsedUsers { get; set; }
    public int AvailableUsers { get; set; }
    public decimal UsersUtilization { get; set; }
    public decimal AverageUtilization { get; set; }
    public string HealthStatus { get; set; } = string.Empty;
}

public class RevenueByTierDTO
{
    public string TierName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public int ClientCount { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal AverageRevenue { get; set; }
    public decimal StandardPrice { get; set; }
}

public class ClientDistributionDTO
{
    public string DistributionType { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class TopClientDTO
{
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public int CurrentEntities { get; set; }
    public int CurrentTemplates { get; set; }
    public int CurrentUsers { get; set; }
    public int TotalUsage { get; set; }
    public decimal ActualMonthlyFee { get; set; }
    public string TierName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}
