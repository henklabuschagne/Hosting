using System.ComponentModel.DataAnnotations;

namespace HostingPlatform.API.DTOs.ServerTiers
{
    public class CreateServerTierDto
    {
        [Required]
        [StringLength(50)]
        public string TierName { get; set; }

        [Required]
        [StringLength(100)]
        public string DisplayName { get; set; }

        [StringLength(500)]
        public string Description { get; set; }
    }
}
