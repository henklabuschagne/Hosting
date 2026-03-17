using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using HostingPlatform.API.DTOs.ServerHealth;
using HostingPlatform.API.Repositories;
using HostingPlatform.API.Services;
using HostingPlatform.API.Models;

namespace HostingPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ServerHealthController : ControllerBase
    {
        private readonly IServerHealthRepository _healthRepository;
        private readonly IServerHealthMonitorService _healthMonitor;

        public ServerHealthController(
            IServerHealthRepository healthRepository,
            IServerHealthMonitorService healthMonitor)
        {
            _healthRepository = healthRepository;
            _healthMonitor = healthMonitor;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }

        // ==================== Thresholds ====================

        [HttpGet("thresholds/{serverId}")]
        public async Task<IActionResult> GetThresholds(int serverId)
        {
            try
            {
                var thresholds = await _healthRepository.GetThresholdsByServerIdAsync(serverId);
                
                if (thresholds == null)
                {
                    return NotFound(new { message = "Thresholds not configured for this server" });
                }

                var dto = MapToThresholdDto(thresholds);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching thresholds", error = ex.Message });
            }
        }

        [HttpPost("thresholds/{serverId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpsertThresholds(int serverId, [FromBody] UpsertServerHealthThresholdDto request)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                var thresholds = new ServerHealthThreshold
                {
                    ServerId = serverId,
                    CPUWarningThreshold = request.CPUWarningThreshold,
                    CPUCriticalThreshold = request.CPUCriticalThreshold,
                    MemoryWarningThreshold = request.MemoryWarningThreshold,
                    MemoryCriticalThreshold = request.MemoryCriticalThreshold,
                    DiskWarningThreshold = request.DiskWarningThreshold,
                    DiskCriticalThreshold = request.DiskCriticalThreshold,
                    HealthCheckUrl = request.HealthCheckUrl,
                    HealthCheckEnabled = request.HealthCheckEnabled,
                    CheckIntervalMinutes = request.CheckIntervalMinutes,
                    EmailAlertsEnabled = request.EmailAlertsEnabled,
                    AlertEmailAddresses = request.AlertEmailAddresses
                };

                var result = await _healthRepository.UpsertThresholdsAsync(serverId, thresholds, userId);
                var dto = MapToThresholdDto(result);
                
                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating thresholds", error = ex.Message });
            }
        }

        // ==================== Metrics ====================

        [HttpGet("metrics/latest")]
        public async Task<IActionResult> GetLatestMetrics([FromQuery] int? serverId = null)
        {
            try
            {
                var metrics = await _healthRepository.GetLatestMetricsAsync(serverId);
                var dtos = metrics.Select(MapToMetricDto).ToList();
                
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching latest metrics", error = ex.Message });
            }
        }

        [HttpGet("metrics/{serverId}/history")]
        public async Task<IActionResult> GetMetricHistory(
            int serverId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] int maxRecords = 1000)
        {
            try
            {
                var metrics = await _healthRepository.GetMetricHistoryAsync(serverId, startDate, endDate, maxRecords);
                var dtos = metrics.Select(MapToMetricDto).ToList();
                
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching metric history", error = ex.Message });
            }
        }

        [HttpPost("metrics/{serverId}/collect")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CollectMetrics(int serverId)
        {
            try
            {
                var metric = await _healthMonitor.CollectHealthMetricsAsync(serverId);
                var dto = MapToMetricDto(metric);
                
                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error collecting metrics", error = ex.Message });
            }
        }

        [HttpPost("metrics/collect-all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CollectAllMetrics()
        {
            try
            {
                // Trigger background collection (fire and forget)
                _ = Task.Run(async () => await _healthMonitor.CollectAllServersHealthAsync());
                
                return Ok(new { message = "Health collection started for all servers" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error starting health collection", error = ex.Message });
            }
        }

        // ==================== Alerts ====================

        [HttpGet("alerts")]
        public async Task<IActionResult> GetActiveAlerts(
            [FromQuery] int? serverId = null,
            [FromQuery] string? severity = null)
        {
            try
            {
                var alerts = await _healthRepository.GetActiveAlertsAsync(serverId, severity);
                var dtos = alerts.Select(MapToAlertDto).ToList();
                
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching alerts", error = ex.Message });
            }
        }

        [HttpPost("alerts/{alertId}/acknowledge")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AcknowledgeAlert(long alertId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var alert = await _healthRepository.AcknowledgeAlertAsync(alertId, userId);
                var dto = MapToAlertDto(alert);
                
                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error acknowledging alert", error = ex.Message });
            }
        }

        [HttpPost("alerts/{alertId}/resolve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ResolveAlert(long alertId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var alert = await _healthRepository.ResolveAlertAsync(alertId, userId);
                var dto = MapToAlertDto(alert);
                
                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error resolving alert", error = ex.Message });
            }
        }

        // ==================== Analytics ====================

        [HttpGet("analytics/{serverId}")]
        public async Task<IActionResult> GetAnalytics(int serverId, [FromQuery] int daysBack = 7)
        {
            try
            {
                var analytics = await _healthRepository.GetAnalyticsAsync(serverId, daysBack);
                
                var dto = new ServerHealthAnalyticsDto
                {
                    AvgCPU = analytics.AvgCPU,
                    AvgMemory = analytics.AvgMemory,
                    AvgDisk = analytics.AvgDisk,
                    PeakCPU = analytics.PeakCPU,
                    PeakMemory = analytics.PeakMemory,
                    PeakDisk = analytics.PeakDisk,
                    MinCPU = analytics.MinCPU,
                    MinMemory = analytics.MinMemory,
                    MinDisk = analytics.MinDisk,
                    TotalReadings = analytics.TotalReadings,
                    CriticalCount = analytics.CriticalCount,
                    WarningCount = analytics.WarningCount,
                    HealthyCount = analytics.HealthyCount,
                    OfflineCount = analytics.OfflineCount,
                    UptimePercentage = analytics.UptimePercentage
                };
                
                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching analytics", error = ex.Message });
            }
        }

        // ==================== Helper Methods ====================

        private ServerHealthThresholdDto MapToThresholdDto(ServerHealthThreshold threshold)
        {
            return new ServerHealthThresholdDto
            {
                ThresholdId = threshold.ThresholdId,
                ServerId = threshold.ServerId,
                CPUWarningThreshold = threshold.CPUWarningThreshold,
                CPUCriticalThreshold = threshold.CPUCriticalThreshold,
                MemoryWarningThreshold = threshold.MemoryWarningThreshold,
                MemoryCriticalThreshold = threshold.MemoryCriticalThreshold,
                DiskWarningThreshold = threshold.DiskWarningThreshold,
                DiskCriticalThreshold = threshold.DiskCriticalThreshold,
                HealthCheckUrl = threshold.HealthCheckUrl,
                HealthCheckEnabled = threshold.HealthCheckEnabled,
                CheckIntervalMinutes = threshold.CheckIntervalMinutes,
                EmailAlertsEnabled = threshold.EmailAlertsEnabled,
                AlertEmailAddresses = threshold.AlertEmailAddresses,
                CreatedDate = threshold.CreatedDate,
                ModifiedDate = threshold.ModifiedDate
            };
        }

        private ServerHealthMetricDto MapToMetricDto(ServerHealthMetric metric)
        {
            return new ServerHealthMetricDto
            {
                MetricId = metric.MetricId,
                ServerId = metric.ServerId,
                ServerName = metric.ServerName,
                ServerType = metric.ServerType,
                CPUUsagePercent = metric.CPUUsagePercent,
                MemoryUsagePercent = metric.MemoryUsagePercent,
                MemoryUsedGB = metric.MemoryUsedGB,
                MemoryTotalGB = metric.MemoryTotalGB,
                DiskUsagePercent = metric.DiskUsagePercent,
                DiskUsedGB = metric.DiskUsedGB,
                DiskTotalGB = metric.DiskTotalGB,
                NetworkInMbps = metric.NetworkInMbps,
                NetworkOutMbps = metric.NetworkOutMbps,
                UptimeDays = metric.UptimeDays,
                ActiveConnections = metric.ActiveConnections,
                HealthStatus = metric.HealthStatus,
                ResponseTimeMs = metric.ResponseTimeMs,
                IsReachable = metric.IsReachable,
                ErrorMessage = metric.ErrorMessage,
                RecordedAt = metric.RecordedAt
            };
        }

        private ServerHealthAlertDto MapToAlertDto(ServerHealthAlert alert)
        {
            return new ServerHealthAlertDto
            {
                AlertId = alert.AlertId,
                ServerId = alert.ServerId,
                ServerName = alert.ServerName,
                ServerType = alert.ServerType,
                AlertType = alert.AlertType,
                Severity = alert.Severity,
                Title = alert.Title,
                Message = alert.Message,
                MetricName = alert.MetricName,
                CurrentValue = alert.CurrentValue,
                ThresholdValue = alert.ThresholdValue,
                Status = alert.Status,
                EmailSent = alert.EmailSent,
                EmailSentAt = alert.EmailSentAt,
                AcknowledgedAt = alert.AcknowledgedAt,
                AcknowledgedBy = alert.AcknowledgedBy,
                ResolvedAt = alert.ResolvedAt,
                ResolvedBy = alert.ResolvedBy,
                CreatedAt = alert.CreatedAt
            };
        }
    }
}
