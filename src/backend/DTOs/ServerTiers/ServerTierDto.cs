namespace HostingPlatform.API.DTOs.ServerTiers
{
    public class ServerTierDto
    {
        public int TierId { get; set; }
        public string TierName { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public List<ServerTierSpecDto> Specifications { get; set; } = new List<ServerTierSpecDto>();
    }
}
