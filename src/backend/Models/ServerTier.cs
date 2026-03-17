namespace HostingPlatform.API.Models
{
    public class ServerTier
    {
        public int TierId { get; set; }
        public string TierName { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public int? CreatedByUserId { get; set; }
        public int? ModifiedByUserId { get; set; }
    }
}
