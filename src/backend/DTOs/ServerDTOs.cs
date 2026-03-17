namespace HostingPlatform.API.DTOs;

public class ServerDTO
{
    public int ServerId { get; set; }
    public string ServerName { get; set; } = string.Empty;
    public string ServerType { get; set; } = string.Empty;
    public int TierId { get; set; }
    public string TierName { get; set; } = string.Empty;
    public string TierDisplayName { get; set; } = string.Empty;
    public int MaxEntities { get; set; }
    public int MaxTemplates { get; set; }
    public int MaxUsers { get; set; }
    public string? IPAddress { get; set; }
    public string? Location { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime ModifiedDate { get; set; }
}

public class CreateServerDTO
{
    public string ServerName { get; set; } = string.Empty;
    public string ServerType { get; set; } = string.Empty;
    public int TierId { get; set; }
    public int MaxEntities { get; set; }
    public int MaxTemplates { get; set; }
    public int MaxUsers { get; set; }
    public string? IPAddress { get; set; }
    public string? Location { get; set; }
    public string Status { get; set; } = "Active";
    public string? Notes { get; set; }
}

public class UpdateServerDTO
{
    public string? ServerName { get; set; }
    public string? ServerType { get; set; }
    public int? TierId { get; set; }
    public int? MaxEntities { get; set; }
    public int? MaxTemplates { get; set; }
    public int? MaxUsers { get; set; }
    public string? IPAddress { get; set; }
    public string? Location { get; set; }
    public string? Status { get; set; }
    public string? Notes { get; set; }
}

public class ServerCapacityDTO
{
    public int ServerId { get; set; }
    public int MaxEntities { get; set; }
    public int UsedEntities { get; set; }
    public int AvailableEntities { get; set; }
    public decimal EntitiesUsagePercent { get; set; }
    public int MaxTemplates { get; set; }
    public int UsedTemplates { get; set; }
    public int AvailableTemplates { get; set; }
    public decimal TemplatesUsagePercent { get; set; }
    public int MaxUsers { get; set; }
    public int UsedUsers { get; set; }
    public int AvailableUsers { get; set; }
    public decimal UsersUsagePercent { get; set; }
    public decimal AverageUsagePercent { get; set; }
}

public class AssignClientToServerDTO
{
    public int ClientId { get; set; }
    public int ServerId { get; set; }
}
