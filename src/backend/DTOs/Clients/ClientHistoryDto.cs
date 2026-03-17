namespace HostingPlatform.API.DTOs.Clients
{
    public class ClientHistoryDto
    {
        public int HistoryId { get; set; }
        public int ClientId { get; set; }
        public int? ApplicationServerId { get; set; }
        public int? DatabaseServerId { get; set; }
        public int TierId { get; set; }
        public string TierName { get; set; }
        public string TierDisplayName { get; set; }
        public string HostingType { get; set; }
        public decimal MonthlyFee { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string ChangeReason { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ApplicationServerName { get; set; }
        public string DatabaseServerName { get; set; }
    }

    public class ClientStatisticsDto
    {
        public int TotalClients { get; set; }
        public int ActiveClients { get; set; }
        public int SuspendedClients { get; set; }
        public int CancelledClients { get; set; }
        public int SharedHostingClients { get; set; }
        public int DedicatedHostingClients { get; set; }
        public decimal TotalMonthlyRevenue { get; set; }
        public decimal AverageMonthlyFee { get; set; }
    }
}
