using System.ComponentModel.DataAnnotations;

namespace HostingPlatform.API.DTOs.ServerTiers
{
    public class UpdateTierSpecDto
    {
        [Required]
        [Range(1, 128)]
        public int CpuCores { get; set; }

        [Required]
        [Range(1, 1024)]
        public int RamGB { get; set; }

        [Required]
        [Range(1, 10000)]
        public int StorageGB { get; set; }

        public bool BackupEnabled { get; set; }

        public string BackupFrequency { get; set; }

        [Range(1, 365)]
        public int BackupRetentionDays { get; set; }

        [Range(1, 10000)]
        public int BandwidthMbps { get; set; }

        public bool PublicIpIncluded { get; set; }

        [Range(1, 100000)]
        public int MaxEntities { get; set; }

        [Range(1, 100000)]
        public int MaxTemplates { get; set; }

        [Range(1, 10000)]
        public int MaxUsers { get; set; }

        [Range(0, 100000)]
        public decimal MonthlyPrice { get; set; }
    }
}
