using System.ComponentModel.DataAnnotations;

namespace HostingPlatform.API.DTOs.Clients
{
    public class CreateClientDto
    {
        [Required]
        [StringLength(100)]
        public string ClientName { get; set; }

        [StringLength(100)]
        public string CompanyName { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string ContactEmail { get; set; }

        [StringLength(50)]
        public string ContactPhone { get; set; }

        public int? CurrentApplicationServerId { get; set; }

        public int? CurrentDatabaseServerId { get; set; }

        [Required]
        [StringLength(50)]
        public string HostingType { get; set; } // Shared or Dedicated

        [Required]
        public int TierId { get; set; }

        [Range(0, int.MaxValue)]
        public int CurrentEntities { get; set; } = 0;

        [Range(0, int.MaxValue)]
        public int CurrentTemplates { get; set; } = 0;

        [Range(0, int.MaxValue)]
        public int CurrentUsers { get; set; } = 0;

        public decimal? DiscussedMonthlyFee { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal ActualMonthlyFee { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [StringLength(50)]
        public string Status { get; set; } = "active";

        public string Notes { get; set; }
    }
}
