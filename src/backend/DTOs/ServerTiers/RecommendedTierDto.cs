namespace HostingPlatform.API.DTOs.ServerTiers
{
    public class RecommendedTierDto
    {
        public int TierId { get; set; }
        public string TierName { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public int MaxEntities { get; set; }
        public int MaxTemplates { get; set; }
        public int MaxUsers { get; set; }
    }

    public class TierRecommendationRequestDto
    {
        public int RequiredEntities { get; set; }
        public int RequiredTemplates { get; set; }
        public int RequiredUsers { get; set; }
    }
}
