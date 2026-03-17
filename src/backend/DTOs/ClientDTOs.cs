namespace HostingPlatform.API.DTOs;

public class ClientDTO
{
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public int TierId { get; set; }
    public string TierName { get; set; } = string.Empty;
    public string TierDisplayName { get; set; } = string.Empty;
    public string HostingType { get; set; } = string.Empty;
    public int CurrentEntities { get; set; }
    public int CurrentTemplates { get; set; }
    public int CurrentUsers { get; set; }
    public decimal DiscussedMonthlyFee { get; set; }
    public decimal ActualMonthlyFee { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime ModifiedDate { get; set; }
    public int MaxEntities { get; set; }
    public int MaxTemplates { get; set; }
    public int MaxUsers { get; set; }
}

public class CreateClientDTO
{
    public string ClientName { get; set; } = string.Empty;
    public int TierId { get; set; }
    public string HostingType { get; set; } = string.Empty;
    public int CurrentEntities { get; set; } = 0;
    public int CurrentTemplates { get; set; } = 0;
    public int CurrentUsers { get; set; } = 0;
    public decimal DiscussedMonthlyFee { get; set; }
    public decimal ActualMonthlyFee { get; set; }
    public string Status { get; set; } = "active";
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string? Notes { get; set; }
}

public class UpdateClientDTO
{
    public string? ClientName { get; set; }
    public int? TierId { get; set; }
    public string? HostingType { get; set; }
    public int? CurrentEntities { get; set; }
    public int? CurrentTemplates { get; set; }
    public int? CurrentUsers { get; set; }
    public decimal? DiscussedMonthlyFee { get; set; }
    public decimal? ActualMonthlyFee { get; set; }
    public string? Status { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string? Notes { get; set; }
}

public class ClientHostingHistoryDTO
{
    public int HistoryId { get; set; }
    public int ClientId { get; set; }
    public int TierId { get; set; }
    public string TierName { get; set; } = string.Empty;
    public string TierDisplayName { get; set; } = string.Empty;
    public int? ServerId { get; set; }
    public string? ServerName { get; set; }
    public string HostingType { get; set; } = string.Empty;
    public int Entities { get; set; }
    public int Templates { get; set; }
    public int Users { get; set; }
    public decimal MonthlyFee { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? ChangeReason { get; set; }
    public int? ChangedBy { get; set; }
    public string? ChangedByUsername { get; set; }
}

public class MoveClientDTO
{
    public int SourceServerId { get; set; }
    public int DestinationServerId { get; set; }
}
