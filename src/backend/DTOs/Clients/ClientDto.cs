namespace HostingPlatform.API.DTOs.Clients
{
    public class ClientDto
    {
        public int ClientId { get; set; }
        public string ClientName { get; set; }
        public string CompanyName { get; set; }
        public string ContactEmail { get; set; }
        public string ContactPhone { get; set; }
        public int? CurrentApplicationServerId { get; set; }
        public int? CurrentDatabaseServerId { get; set; }
        public string HostingType { get; set; }
        public int TierId { get; set; }
        public string TierName { get; set; }
        public string TierDisplayName { get; set; }
        public int CurrentEntities { get; set; }
        public int CurrentTemplates { get; set; }
        public int CurrentUsers { get; set; }
        public decimal? DiscussedMonthlyFee { get; set; }
        public decimal ActualMonthlyFee { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Status { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public string Notes { get; set; }
        public string ApplicationServerName { get; set; }
        public string DatabaseServerName { get; set; }
    }
}
