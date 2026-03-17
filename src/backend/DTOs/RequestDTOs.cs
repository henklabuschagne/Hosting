namespace HostingPlatform.API.DTOs;

public class TierRequestDTO
{
    public int RequestId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public int RequestedEntities { get; set; }
    public int RequestedTemplates { get; set; }
    public int RequestedUsers { get; set; }
    public int? RecommendedTierId { get; set; }
    public string? RecommendedTierName { get; set; }
    public decimal? EstimatedMonthlyCost { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime RequestDate { get; set; }
    public DateTime? ReviewedDate { get; set; }
    public int? ReviewedBy { get; set; }
    public string? ReviewedByUsername { get; set; }
    public string? Notes { get; set; }
}

public class CreateTierRequestDTO
{
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public int RequestedEntities { get; set; }
    public int RequestedTemplates { get; set; }
    public int RequestedUsers { get; set; }
}

public class UpdateTierRequestStatusDTO
{
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
}
