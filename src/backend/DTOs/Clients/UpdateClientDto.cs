using System.ComponentModel.DataAnnotations;

namespace HostingPlatform.API.DTOs.Clients
{
    public class UpdateClientDto
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

        public decimal? DiscussedMonthlyFee { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal ActualMonthlyFee { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; }

        public string Notes { get; set; }
    }

    public class MoveClientToServerDto
    {
        [Required]
        public int NewApplicationServerId { get; set; }

        [Required]
        public int NewDatabaseServerId { get; set; }

        [Required]
        public string ChangeReason { get; set; }
    }

    public class UpdateClientUsageDto
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
}
