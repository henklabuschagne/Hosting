using HostingPlatform.API.Models;
using HostingPlatform.API.Repositories;
using HostingPlatform.API.DTOs.ServerHealth;
using System.Diagnostics;

namespace HostingPlatform.API.Services
{
    public interface IServerHealthMonitorService
    {
        Task<ServerHealthMetric> CollectHealthMetricsAsync(int serverId);
        Task CollectAllServersHealthAsync();
    }

    public class ServerHealthMonitorService : IServerHealthMonitorService
    {
        private readonly IServerHealthRepository _healthRepository;
        private readonly IServerRepository _serverRepository;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IEmailNotificationService _emailService;
        private readonly ILogger<ServerHealthMonitorService> _logger;

        public ServerHealthMonitorService(
            IServerHealthRepository healthRepository,
            IServerRepository serverRepository,
            IHttpClientFactory httpClientFactory,
            IEmailNotificationService emailService,
            ILogger<ServerHealthMonitorService> logger)
        {
            _healthRepository = healthRepository;
            _serverRepository = serverRepository;
            _httpClientFactory = httpClientFactory;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<ServerHealthMetric> CollectHealthMetricsAsync(int serverId)
        {
            var sw = Stopwatch.StartNew();
            
            try
            {
                // Get server details
                var server = await _serverRepository.GetServerByIdAsync(serverId);
                if (server == null)
                {
                    throw new InvalidOperationException($"Server {serverId} not found");
                }

                // Get health check configuration
                var thresholds = await _healthRepository.GetThresholdsByServerIdAsync(serverId);
                
                if (thresholds == null || !thresholds.HealthCheckEnabled || string.IsNullOrEmpty(thresholds.HealthCheckUrl))
                {
                    _logger.LogWarning($"Health check not configured for server {serverId}");
                    return CreateOfflineMetric(serverId, "Health check not configured");
                }

                // Fetch metrics from external health API
                var httpClient = _httpClientFactory.CreateClient();
                httpClient.Timeout = TimeSpan.FromSeconds(30);

                var response = await httpClient.GetAsync(thresholds.HealthCheckUrl);
                sw.Stop();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError($"Health check failed for server {serverId}: HTTP {response.StatusCode}");
                    return CreateOfflineMetric(serverId, $"HTTP {response.StatusCode}", (int)sw.ElapsedMilliseconds);
                }

                var healthData = await response.Content.ReadFromJsonAsync<ExternalHealthResponseDto>();
                if (healthData == null)
                {
                    return CreateOfflineMetric(serverId, "Invalid response from health endpoint", (int)sw.ElapsedMilliseconds);
                }

                // Create metric from external data
                var metric = new ServerHealthMetric
                {
                    ServerId = serverId,
                    CPUUsagePercent = healthData.CpuUsage,
                    MemoryUsagePercent = healthData.MemoryUsage,
                    MemoryUsedGB = healthData.MemoryUsedGB,
                    MemoryTotalGB = healthData.MemoryTotalGB,
                    DiskUsagePercent = healthData.DiskUsage,
                    DiskUsedGB = healthData.DiskUsedGB,
                    DiskTotalGB = healthData.DiskTotalGB,
                    NetworkInMbps = healthData.NetworkInMbps,
                    NetworkOutMbps = healthData.NetworkOutMbps,
                    UptimeDays = healthData.UptimeDays,
                    ActiveConnections = healthData.ActiveConnections,
                    ResponseTimeMs = (int)sw.ElapsedMilliseconds,
                    IsReachable = true,
                    ErrorMessage = null
                };

                // Save to database (this also triggers alert checks)
                var savedMetric = await _healthRepository.InsertMetricAsync(metric);
                
                _logger.LogInformation($"Successfully collected health metrics for server {serverId}");
                
                return savedMetric;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, $"Network error collecting health for server {serverId}");
                return await SaveOfflineMetric(serverId, $"Network error: {ex.Message}", (int)sw.ElapsedMilliseconds);
            }
            catch (TaskCanceledException ex)
            {
                _logger.LogError(ex, $"Timeout collecting health for server {serverId}");
                return await SaveOfflineMetric(serverId, "Request timeout", (int)sw.ElapsedMilliseconds);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error collecting health for server {serverId}");
                return await SaveOfflineMetric(serverId, ex.Message, (int)sw.ElapsedMilliseconds);
            }
        }

        public async Task CollectAllServersHealthAsync()
        {
            try
            {
                _logger.LogInformation("Starting health collection for all servers");

                var servers = await _serverRepository.GetAllServersAsync();
                var activeServers = servers.Where(s => s.IsActive).ToList();

                _logger.LogInformation($"Found {activeServers.Count} active servers to monitor");

                // Collect metrics in parallel with max degree of parallelism
                var tasks = activeServers.Select(server => CollectHealthMetricsAsync(server.ServerId));
                await Task.WhenAll(tasks);

                _logger.LogInformation("Completed health collection for all servers");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error collecting health for all servers");
            }
        }

        private ServerHealthMetric CreateOfflineMetric(int serverId, string errorMessage, int? responseTimeMs = null)
        {
            return new ServerHealthMetric
            {
                ServerId = serverId,
                CPUUsagePercent = 0,
                MemoryUsagePercent = 0,
                MemoryUsedGB = 0,
                MemoryTotalGB = 0,
                DiskUsagePercent = 0,
                DiskUsedGB = 0,
                DiskTotalGB = 0,
                ResponseTimeMs = responseTimeMs,
                IsReachable = false,
                ErrorMessage = errorMessage,
                HealthStatus = "Offline"
            };
        }

        private async Task<ServerHealthMetric> SaveOfflineMetric(int serverId, string errorMessage, int? responseTimeMs = null)
        {
            var metric = CreateOfflineMetric(serverId, errorMessage, responseTimeMs);
            return await _healthRepository.InsertMetricAsync(metric);
        }
    }

    // Background service to run health checks periodically
    public class ServerHealthBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ServerHealthBackgroundService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromHours(1); // Hourly checks

        public ServerHealthBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<ServerHealthBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Server Health Background Service started");

            // Wait a bit before starting first check
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation("Starting scheduled health check");

                    using var scope = _serviceProvider.CreateScope();
                    var healthMonitor = scope.ServiceProvider.GetRequiredService<IServerHealthMonitorService>();
                    
                    await healthMonitor.CollectAllServersHealthAsync();

                    _logger.LogInformation($"Health check completed. Next check in {_checkInterval.TotalMinutes} minutes");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in background health check");
                }

                // Wait for next check interval
                await Task.Delay(_checkInterval, stoppingToken);
            }

            _logger.LogInformation("Server Health Background Service stopped");
        }
    }
}