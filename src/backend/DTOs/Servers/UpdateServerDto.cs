using System.ComponentModel.DataAnnotations;

namespace HostingPlatform.API.DTOs.Servers
{
    public class UpdateServerDto
    {
        [Required]
        [StringLength(100)]
        public string ServerName { get; set; }

        [StringLength(100)]
        public string Location { get; set; }

        [StringLength(50)]
        public string IpAddress { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; }

        public string Notes { get; set; }
    }

    public class UpdateServerLoadDto
    {
        [Required]
        [Range(0, int.MaxValue)]
        public int CurrentEntities { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int CurrentTemplates { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int CurrentUsers { get; set; }
    }

    public class UpdateServerStatusDto
    {
        [Required]
        [StringLength(50)]
        public string Status { get; set; }
    }
}
