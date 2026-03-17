using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using HostingPlatform.API.DTOs.ServerTiers;
using HostingPlatform.API.Models;
using HostingPlatform.API.Repositories;

namespace HostingPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ServerTiersController : ControllerBase
    {
        private readonly IServerTierRepository _tierRepository;

        public ServerTiersController(IServerTierRepository tierRepository)
        {
            _tierRepository = tierRepository;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTiers()
        {
            try
            {
                var tiers = await _tierRepository.GetAllServerTiersAsync();
                var tierSpecs = await _tierRepository.GetAllTierSpecsAsync();

                var tierDtos = tiers.Select(t => new ServerTierDto
                {
                    TierId = t.TierId,
                    TierName = t.TierName,
                    DisplayName = t.DisplayName,
                    Description = t.Description,
                    IsActive = t.IsActive,
                    CreatedDate = t.CreatedDate,
                    ModifiedDate = t.ModifiedDate,
                    Specifications = tierSpecs.ContainsKey(t.TierId)
                        ? tierSpecs[t.TierId].Select(s => new ServerTierSpecDto
                        {
                            SpecId = s.SpecId,
                            TierId = s.TierId,
                            ServerType = s.ServerType,
                            CpuCores = s.CpuCores,
                            RamGB = s.RamGB,
                            StorageGB = s.StorageGB,
                            BackupEnabled = s.BackupEnabled,
                            BackupFrequency = s.BackupFrequency,
                            BackupRetentionDays = s.BackupRetentionDays,
                            BandwidthMbps = s.BandwidthMbps,
                            PublicIpIncluded = s.PublicIpIncluded,
                            MaxEntities = s.MaxEntities,
                            MaxTemplates = s.MaxTemplates,
                            MaxUsers = s.MaxUsers,
                            MonthlyPrice = s.MonthlyPrice,
                            CreatedDate = s.CreatedDate,
                            ModifiedDate = s.ModifiedDate
                        }).ToList()
                        : new List<ServerTierSpecDto>()
                }).ToList();

                return Ok(tierDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching tiers", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTierById(int id)
        {
            try
            {
                var tier = await _tierRepository.GetServerTierByIdAsync(id);
                
                if (tier == null)
                {
                    return NotFound(new { message = "Server tier not found" });
                }

                var specs = await _tierRepository.GetTierSpecsByTierIdAsync(id);

                var tierDto = new ServerTierDto
                {
                    TierId = tier.TierId,
                    TierName = tier.TierName,
                    DisplayName = tier.DisplayName,
                    Description = tier.Description,
                    IsActive = tier.IsActive,
                    CreatedDate = tier.CreatedDate,
                    ModifiedDate = tier.ModifiedDate,
                    Specifications = specs.Select(s => new ServerTierSpecDto
                    {
                        SpecId = s.SpecId,
                        TierId = s.TierId,
                        ServerType = s.ServerType,
                        CpuCores = s.CpuCores,
                        RamGB = s.RamGB,
                        StorageGB = s.StorageGB,
                        BackupEnabled = s.BackupEnabled,
                        BackupFrequency = s.BackupFrequency,
                        BackupRetentionDays = s.BackupRetentionDays,
                        BandwidthMbps = s.BandwidthMbps,
                        PublicIpIncluded = s.PublicIpIncluded,
                        MaxEntities = s.MaxEntities,
                        MaxTemplates = s.MaxTemplates,
                        MaxUsers = s.MaxUsers,
                        MonthlyPrice = s.MonthlyPrice,
                        CreatedDate = s.CreatedDate,
                        ModifiedDate = s.ModifiedDate
                    }).ToList()
                };

                return Ok(tierDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching tier", error = ex.Message });
            }
        }

        [HttpGet("by-name/{tierName}")]
        public async Task<IActionResult> GetTierByName(string tierName)
        {
            try
            {
                var tier = await _tierRepository.GetServerTierByNameAsync(tierName);
                
                if (tier == null)
                {
                    return NotFound(new { message = "Server tier not found" });
                }

                var specs = await _tierRepository.GetTierSpecsByTierIdAsync(tier.TierId);

                var tierDto = new ServerTierDto
                {
                    TierId = tier.TierId,
                    TierName = tier.TierName,
                    DisplayName = tier.DisplayName,
                    Description = tier.Description,
                    IsActive = tier.IsActive,
                    CreatedDate = tier.CreatedDate,
                    ModifiedDate = tier.ModifiedDate,
                    Specifications = specs.Select(s => new ServerTierSpecDto
                    {
                        SpecId = s.SpecId,
                        TierId = s.TierId,
                        ServerType = s.ServerType,
                        CpuCores = s.CpuCores,
                        RamGB = s.RamGB,
                        StorageGB = s.StorageGB,
                        BackupEnabled = s.BackupEnabled,
                        BackupFrequency = s.BackupFrequency,
                        BackupRetentionDays = s.BackupRetentionDays,
                        BandwidthMbps = s.BandwidthMbps,
                        PublicIpIncluded = s.PublicIpIncluded,
                        MaxEntities = s.MaxEntities,
                        MaxTemplates = s.MaxTemplates,
                        MaxUsers = s.MaxUsers,
                        MonthlyPrice = s.MonthlyPrice,
                        CreatedDate = s.CreatedDate,
                        ModifiedDate = s.ModifiedDate
                    }).ToList()
                };

                return Ok(tierDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching tier", error = ex.Message });
            }
        }

        [HttpPut("specs/{specId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateTierSpec(int specId, [FromBody] UpdateTierSpecDto request)
        {
            try
            {
                var spec = new ServerTierSpec
                {
                    CpuCores = request.CpuCores,
                    RamGB = request.RamGB,
                    StorageGB = request.StorageGB,
                    BackupEnabled = request.BackupEnabled,
                    BackupFrequency = request.BackupFrequency,
                    BackupRetentionDays = request.BackupRetentionDays,
                    BandwidthMbps = request.BandwidthMbps,
                    PublicIpIncluded = request.PublicIpIncluded,
                    MaxEntities = request.MaxEntities,
                    MaxTemplates = request.MaxTemplates,
                    MaxUsers = request.MaxUsers,
                    MonthlyPrice = request.MonthlyPrice
                };

                var updatedSpec = await _tierRepository.UpdateTierSpecAsync(specId, spec);

                if (updatedSpec == null)
                {
                    return NotFound(new { message = "Tier specification not found" });
                }

                var specDto = new ServerTierSpecDto
                {
                    SpecId = updatedSpec.SpecId,
                    TierId = updatedSpec.TierId,
                    ServerType = updatedSpec.ServerType,
                    CpuCores = updatedSpec.CpuCores,
                    RamGB = updatedSpec.RamGB,
                    StorageGB = updatedSpec.StorageGB,
                    BackupEnabled = updatedSpec.BackupEnabled,
                    BackupFrequency = updatedSpec.BackupFrequency,
                    BackupRetentionDays = updatedSpec.BackupRetentionDays,
                    BandwidthMbps = updatedSpec.BandwidthMbps,
                    PublicIpIncluded = updatedSpec.PublicIpIncluded,
                    MaxEntities = updatedSpec.MaxEntities,
                    MaxTemplates = updatedSpec.MaxTemplates,
                    MaxUsers = updatedSpec.MaxUsers,
                    MonthlyPrice = updatedSpec.MonthlyPrice,
                    CreatedDate = updatedSpec.CreatedDate,
                    ModifiedDate = updatedSpec.ModifiedDate
                };

                return Ok(specDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating tier specification", error = ex.Message });
            }
        }

        [HttpPost("recommend")]
        public async Task<IActionResult> GetRecommendedTier([FromBody] TierRecommendationRequestDto request)
        {
            try
            {
                var recommendedTier = await _tierRepository.GetRecommendedTierAsync(
                    request.RequiredEntities,
                    request.RequiredTemplates,
                    request.RequiredUsers
                );

                if (recommendedTier == null)
                {
                    return NotFound(new { message = "No suitable tier found for the given requirements" });
                }

                var dto = new RecommendedTierDto
                {
                    TierId = recommendedTier.TierId,
                    TierName = recommendedTier.TierName,
                    DisplayName = recommendedTier.DisplayName,
                    Description = recommendedTier.Description,
                    MaxEntities = recommendedTier.MaxEntities,
                    MaxTemplates = recommendedTier.MaxTemplates,
                    MaxUsers = recommendedTier.MaxUsers
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while getting tier recommendation", error = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateTier([FromBody] CreateServerTierDto request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var tier = await _tierRepository.CreateServerTierAsync(
                    request.TierName,
                    request.DisplayName,
                    request.Description,
                    userId
                );

                var tierDto = new ServerTierDto
                {
                    TierId = tier.TierId,
                    TierName = tier.TierName,
                    DisplayName = tier.DisplayName,
                    Description = tier.Description,
                    IsActive = tier.IsActive,
                    CreatedDate = tier.CreatedDate,
                    ModifiedDate = tier.ModifiedDate,
                    Specifications = new List<ServerTierSpecDto>()
                };

                return Ok(tierDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating tier", error = ex.Message });
            }
        }
    }
}
