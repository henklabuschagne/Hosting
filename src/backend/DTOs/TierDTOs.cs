namespace HostingPlatform.API.DTOs;

public class ServerTierDTO
{
    public int TierId { get; set; }
    public string TierName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public int MaxEntities { get; set; }
    public int MaxTemplates { get; set; }
    public int MaxUsers { get; set; }
    public decimal PricePerMonth { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime ModifiedDate { get; set; }
}

public class CreateServerTierDTO
{
    public string TierName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public int MaxEntities { get; set; }
    public int MaxTemplates { get; set; }
    public int MaxUsers { get; set; }
    public decimal PricePerMonth { get; set; }
    public string? Description { get; set; }
}

public class UpdateServerTierDTO
{
    public string? DisplayName { get; set; }
    public int? MaxEntities { get; set; }
    public int? MaxTemplates { get; set; }
    public int? MaxUsers { get; set; }
    public decimal? PricePerMonth { get; set; }
    public string? Description { get; set; }
}

public class TierRecommendationRequestDTO
{
    public int RequestedEntities { get; set; }
    public int RequestedTemplates { get; set; }
    public int RequestedUsers { get; set; }
}

public class TierRecommendationResponseDTO
{
    public int TierId { get; set; }
    public string TierName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public int MaxEntities { get; set; }
    public int MaxTemplates { get; set; }
    public int MaxUsers { get; set; }
    public decimal PricePerMonth { get; set; }
    public string? Description { get; set; }
    public decimal EntitiesHeadroom { get; set; }
    public decimal TemplatesHeadroom { get; set; }
    public decimal UsersHeadroom { get; set; }
}
