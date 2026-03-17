namespace HostingPlatform.API.DTOs.ServerTiers
{
    public class ServerTierSpecDto
    {
        public int SpecId { get; set; }
        public int TierId { get; set; }
        public string ServerType { get; set; }
        public int CpuCores { get; set; }
        public int RamGB { get; set; }
        public int StorageGB { get; set; }
        public bool BackupEnabled { get; set; }
        public string BackupFrequency { get; set; }
        public int BackupRetentionDays { get; set; }
        public int BandwidthMbps { get; set; }
        public bool PublicIpIncluded { get; set; }
        public int MaxEntities { get; set; }
        public int MaxTemplates { get; set; }
        public int MaxUsers { get; set; }
        public decimal MonthlyPrice { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
    }
}
