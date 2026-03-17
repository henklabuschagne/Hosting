namespace HostingPlatform.API.DTOs.Servers
{
    public class ServerDto
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
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public string Notes { get; set; }
    }
}
