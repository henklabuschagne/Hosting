using HostingPlatform.API.Models;

namespace HostingPlatform.API.Repositories
{
    public interface IServerTierRepository
    {
        Task<List<ServerTier>> GetAllServerTiersAsync();
        Task<ServerTier> GetServerTierByIdAsync(int tierId);
        Task<ServerTier> GetServerTierByNameAsync(string tierName);
        Task<List<ServerTierSpec>> GetTierSpecsByTierIdAsync(int tierId);
        Task<Dictionary<int, List<ServerTierSpec>>> GetAllTierSpecsAsync();
        Task<ServerTierSpec> UpdateTierSpecAsync(int specId, ServerTierSpec spec);
        Task<ServerTier> CreateServerTierAsync(string tierName, string displayName, string description, int createdByUserId);
        Task<ServerTier> UpdateServerTierAsync(int tierId, string displayName, string description, int modifiedByUserId);
        Task<ServerTierSpec> CreateTierSpecAsync(ServerTierSpec spec);
        Task<RecommendedTier> GetRecommendedTierAsync(int requiredEntities, int requiredTemplates, int requiredUsers);
        Task DeleteServerTierAsync(int tierId, int modifiedByUserId);
    }

    public class RecommendedTier
    {
        public int TierId { get; set; }
        public string TierName { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public int MaxEntities { get; set; }
        public int MaxTemplates { get; set; }
        public int MaxUsers { get; set; }
    }
}
