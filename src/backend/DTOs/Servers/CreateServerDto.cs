using System.ComponentModel.DataAnnotations;

namespace HostingPlatform.API.DTOs.Servers
{
    public class CreateServerDto
    {
        [Required]
        [StringLength(100)]
        public string ServerName { get; set; }

        [Required]
        public int TierId { get; set; }

        [Required]
        [StringLength(50)]
        public string ServerType { get; set; } // Application or Database

        [Required]
        [StringLength(50)]
        public string HostingType { get; set; } // Shared or Dedicated

        [Required]
        [Range(1, 128)]
        public int CpuCores { get; set; }

        [Required]
        [Range(1, 1024)]
        public int RamGB { get; set; }

        [Required]
        [Range(1, 10000)]
        public int StorageGB { get; set; }

        [StringLength(100)]
        public string Location { get; set; }

        [StringLength(50)]
        public string IpAddress { get; set; }

        [StringLength(50)]
        public string Status { get; set; } = "active";

        public string Notes { get; set; }
    }
}
