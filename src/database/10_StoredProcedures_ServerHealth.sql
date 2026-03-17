-- =============================================
-- Server Health Monitoring Stored Procedures
-- =============================================

USE HostingPlatformDB;
GO

-- =============================================
-- SP: Get Server Health Thresholds
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetServerHealthThresholds')
    DROP PROCEDURE sp_GetServerHealthThresholds;
GO

CREATE PROCEDURE sp_GetServerHealthThresholds
    @ServerId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ThresholdId, ServerId,
        CPUWarningThreshold, CPUCriticalThreshold,
        MemoryWarningThreshold, MemoryCriticalThreshold,
        DiskWarningThreshold, DiskCriticalThreshold,
        HealthCheckUrl, HealthCheckEnabled, CheckIntervalMinutes,
        EmailAlertsEnabled, AlertEmailAddresses,
        CreatedDate, ModifiedDate, CreatedBy, ModifiedBy
    FROM ServerHealthThresholds
    WHERE ServerId = @ServerId;
END
GO

-- =============================================
-- SP: Upsert Server Health Thresholds
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UpsertServerHealthThresholds')
    DROP PROCEDURE sp_UpsertServerHealthThresholds;
GO

CREATE PROCEDURE sp_UpsertServerHealthThresholds
    @ServerId INT,
    @CPUWarningThreshold DECIMAL(5,2) = 70.00,
    @CPUCriticalThreshold DECIMAL(5,2) = 90.00,
    @MemoryWarningThreshold DECIMAL(5,2) = 75.00,
    @MemoryCriticalThreshold DECIMAL(5,2) = 90.00,
    @DiskWarningThreshold DECIMAL(5,2) = 80.00,
    @DiskCriticalThreshold DECIMAL(5,2) = 95.00,
    @HealthCheckUrl NVARCHAR(500) = NULL,
    @HealthCheckEnabled BIT = 1,
    @CheckIntervalMinutes INT = 60,
    @EmailAlertsEnabled BIT = 1,
    @AlertEmailAddresses NVARCHAR(1000) = NULL,
    @UserId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Check if thresholds exist
        IF EXISTS (SELECT 1 FROM ServerHealthThresholds WHERE ServerId = @ServerId)
        BEGIN
            -- Update existing
            UPDATE ServerHealthThresholds
            SET 
                CPUWarningThreshold = @CPUWarningThreshold,
                CPUCriticalThreshold = @CPUCriticalThreshold,
                MemoryWarningThreshold = @MemoryWarningThreshold,
                MemoryCriticalThreshold = @MemoryCriticalThreshold,
                DiskWarningThreshold = @DiskWarningThreshold,
                DiskCriticalThreshold = @DiskCriticalThreshold,
                HealthCheckUrl = @HealthCheckUrl,
                HealthCheckEnabled = @HealthCheckEnabled,
                CheckIntervalMinutes = @CheckIntervalMinutes,
                EmailAlertsEnabled = @EmailAlertsEnabled,
                AlertEmailAddresses = @AlertEmailAddresses,
                ModifiedDate = GETUTCDATE(),
                ModifiedBy = @UserId
            WHERE ServerId = @ServerId;
        END
        ELSE
        BEGIN
            -- Insert new
            INSERT INTO ServerHealthThresholds (
                ServerId, CPUWarningThreshold, CPUCriticalThreshold,
                MemoryWarningThreshold, MemoryCriticalThreshold,
                DiskWarningThreshold, DiskCriticalThreshold,
                HealthCheckUrl, HealthCheckEnabled, CheckIntervalMinutes,
                EmailAlertsEnabled, AlertEmailAddresses,
                CreatedBy, ModifiedBy
            )
            VALUES (
                @ServerId, @CPUWarningThreshold, @CPUCriticalThreshold,
                @MemoryWarningThreshold, @MemoryCriticalThreshold,
                @DiskWarningThreshold, @DiskCriticalThreshold,
                @HealthCheckUrl, @HealthCheckEnabled, @CheckIntervalMinutes,
                @EmailAlertsEnabled, @AlertEmailAddresses,
                @UserId, @UserId
            );
        END
        
        -- Return the thresholds
        EXEC sp_GetServerHealthThresholds @ServerId;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END
GO

-- =============================================
-- SP: Insert Server Health Metrics
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_InsertServerHealthMetrics')
    DROP PROCEDURE sp_InsertServerHealthMetrics;
GO

CREATE PROCEDURE sp_InsertServerHealthMetrics
    @ServerId INT,
    @CPUUsagePercent DECIMAL(5,2),
    @MemoryUsagePercent DECIMAL(5,2),
    @MemoryUsedGB DECIMAL(10,2),
    @MemoryTotalGB DECIMAL(10,2),
    @DiskUsagePercent DECIMAL(5,2),
    @DiskUsedGB DECIMAL(10,2),
    @DiskTotalGB DECIMAL(10,2),
    @NetworkInMbps DECIMAL(10,2) = NULL,
    @NetworkOutMbps DECIMAL(10,2) = NULL,
    @UptimeDays DECIMAL(10,2) = NULL,
    @ActiveConnections INT = NULL,
    @ResponseTimeMs INT = NULL,
    @IsReachable BIT = 1,
    @ErrorMessage NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DECLARE @HealthStatus NVARCHAR(50) = 'Healthy';
        DECLARE @MetricId BIGINT;
        DECLARE @AlertsCreated INT = 0;
        
        -- Determine health status based on thresholds
        IF EXISTS (SELECT 1 FROM ServerHealthThresholds WHERE ServerId = @ServerId)
        BEGIN
            DECLARE @CPUCritical DECIMAL(5,2), @MemoryCritical DECIMAL(5,2), @DiskCritical DECIMAL(5,2);
            DECLARE @CPUWarning DECIMAL(5,2), @MemoryWarning DECIMAL(5,2), @DiskWarning DECIMAL(5,2);
            
            SELECT 
                @CPUCritical = CPUCriticalThreshold,
                @CPUWarning = CPUWarningThreshold,
                @MemoryCritical = MemoryCriticalThreshold,
                @MemoryWarning = MemoryWarningThreshold,
                @DiskCritical = DiskCriticalThreshold,
                @DiskWarning = DiskWarningThreshold
            FROM ServerHealthThresholds
            WHERE ServerId = @ServerId;
            
            IF @IsReachable = 0
                SET @HealthStatus = 'Offline';
            ELSE IF @CPUUsagePercent >= @CPUCritical OR @MemoryUsagePercent >= @MemoryCritical OR @DiskUsagePercent >= @DiskCritical
                SET @HealthStatus = 'Critical';
            ELSE IF @CPUUsagePercent >= @CPUWarning OR @MemoryUsagePercent >= @MemoryWarning OR @DiskUsagePercent >= @DiskWarning
                SET @HealthStatus = 'Warning';
        END
        
        -- Insert metrics
        INSERT INTO ServerHealthMetrics (
            ServerId, CPUUsagePercent, MemoryUsagePercent, MemoryUsedGB, MemoryTotalGB,
            DiskUsagePercent, DiskUsedGB, DiskTotalGB,
            NetworkInMbps, NetworkOutMbps, UptimeDays, ActiveConnections,
            HealthStatus, ResponseTimeMs, IsReachable, ErrorMessage
        )
        VALUES (
            @ServerId, @CPUUsagePercent, @MemoryUsagePercent, @MemoryUsedGB, @MemoryTotalGB,
            @DiskUsagePercent, @DiskUsedGB, @DiskTotalGB,
            @NetworkInMbps, @NetworkOutMbps, @UptimeDays, @ActiveConnections,
            @HealthStatus, @ResponseTimeMs, @IsReachable, @ErrorMessage
        );
        
        SET @MetricId = SCOPE_IDENTITY();
        
        -- Check and create alerts if thresholds exceeded
        IF @HealthStatus IN ('Warning', 'Critical', 'Offline')
        BEGIN
            EXEC sp_CheckAndCreateHealthAlerts @ServerId, @MetricId;
            
            -- Count how many alerts were created
            SELECT @AlertsCreated = COUNT(*) 
            FROM ServerHealthAlerts 
            WHERE MetricId = @MetricId AND Status = 'Active';
        END
        
        -- Return the inserted metric
        SELECT * FROM ServerHealthMetrics WHERE MetricId = @MetricId;
        
        -- Return alert count as second result set for backend processing
        SELECT @AlertsCreated AS AlertsCreated;
        
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMsg, 16, 1);
    END CATCH
END
GO

-- =============================================
-- SP: Check and Create Health Alerts
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_CheckAndCreateHealthAlerts')
    DROP PROCEDURE sp_CheckAndCreateHealthAlerts;
GO

CREATE PROCEDURE sp_CheckAndCreateHealthAlerts
    @ServerId INT,
    @MetricId BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CPUUsage DECIMAL(5,2), @MemoryUsage DECIMAL(5,2), @DiskUsage DECIMAL(5,2);
    DECLARE @CPUCritical DECIMAL(5,2), @CPUWarning DECIMAL(5,2);
    DECLARE @MemoryCritical DECIMAL(5,2), @MemoryWarning DECIMAL(5,2);
    DECLARE @DiskCritical DECIMAL(5,2), @DiskWarning DECIMAL(5,2);
    DECLARE @ServerName NVARCHAR(200);
    
    -- Get metric values
    SELECT 
        @CPUUsage = CPUUsagePercent,
        @MemoryUsage = MemoryUsagePercent,
        @DiskUsage = DiskUsagePercent
    FROM ServerHealthMetrics
    WHERE MetricId = @MetricId;
    
    -- Get thresholds
    SELECT 
        @CPUCritical = CPUCriticalThreshold,
        @CPUWarning = CPUWarningThreshold,
        @MemoryCritical = MemoryCriticalThreshold,
        @MemoryWarning = MemoryWarningThreshold,
        @DiskCritical = DiskCriticalThreshold,
        @DiskWarning = DiskWarningThreshold
    FROM ServerHealthThresholds
    WHERE ServerId = @ServerId;
    
    -- Get server name
    SELECT @ServerName = ServerName FROM Servers WHERE ServerId = @ServerId;
    
    -- Check CPU
    IF @CPUUsage >= @CPUCritical
    BEGIN
        -- Check if alert already active
        IF NOT EXISTS (
            SELECT 1 FROM ServerHealthAlerts 
            WHERE ServerId = @ServerId AND AlertType = 'CPU' AND Severity = 'Critical' AND Status = 'Active'
        )
        BEGIN
            INSERT INTO ServerHealthAlerts (
                ServerId, MetricId, AlertType, Severity, 
                Title, Message, MetricName, CurrentValue, ThresholdValue
            )
            VALUES (
                @ServerId, @MetricId, 'CPU', 'Critical',
                'Critical CPU Usage on ' + @ServerName,
                'CPU usage has exceeded critical threshold. Current: ' + CAST(@CPUUsage AS NVARCHAR) + '%, Threshold: ' + CAST(@CPUCritical AS NVARCHAR) + '%',
                'CPU', @CPUUsage, @CPUCritical
            );
        END
    END
    ELSE IF @CPUUsage >= @CPUWarning
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM ServerHealthAlerts 
            WHERE ServerId = @ServerId AND AlertType = 'CPU' AND Severity = 'Warning' AND Status = 'Active'
        )
        BEGIN
            INSERT INTO ServerHealthAlerts (
                ServerId, MetricId, AlertType, Severity,
                Title, Message, MetricName, CurrentValue, ThresholdValue
            )
            VALUES (
                @ServerId, @MetricId, 'CPU', 'Warning',
                'High CPU Usage on ' + @ServerName,
                'CPU usage has exceeded warning threshold. Current: ' + CAST(@CPUUsage AS NVARCHAR) + '%, Threshold: ' + CAST(@CPUWarning AS NVARCHAR) + '%',
                'CPU', @CPUUsage, @CPUWarning
            );
        END
    END
    
    -- Check Memory
    IF @MemoryUsage >= @MemoryCritical
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM ServerHealthAlerts 
            WHERE ServerId = @ServerId AND AlertType = 'Memory' AND Severity = 'Critical' AND Status = 'Active'
        )
        BEGIN
            INSERT INTO ServerHealthAlerts (
                ServerId, MetricId, AlertType, Severity,
                Title, Message, MetricName, CurrentValue, ThresholdValue
            )
            VALUES (
                @ServerId, @MetricId, 'Memory', 'Critical',
                'Critical Memory Usage on ' + @ServerName,
                'Memory usage has exceeded critical threshold. Current: ' + CAST(@MemoryUsage AS NVARCHAR) + '%, Threshold: ' + CAST(@MemoryCritical AS NVARCHAR) + '%',
                'Memory', @MemoryUsage, @MemoryCritical
            );
        END
    END
    ELSE IF @MemoryUsage >= @MemoryWarning
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM ServerHealthAlerts 
            WHERE ServerId = @ServerId AND AlertType = 'Memory' AND Severity = 'Warning' AND Status = 'Active'
        )
        BEGIN
            INSERT INTO ServerHealthAlerts (
                ServerId, MetricId, AlertType, Severity,
                Title, Message, MetricName, CurrentValue, ThresholdValue
            )
            VALUES (
                @ServerId, @MetricId, 'Memory', 'Warning',
                'High Memory Usage on ' + @ServerName,
                'Memory usage has exceeded warning threshold. Current: ' + CAST(@MemoryUsage AS NVARCHAR) + '%, Threshold: ' + CAST(@MemoryWarning AS NVARCHAR) + '%',
                'Memory', @MemoryUsage, @MemoryWarning
            );
        END
    END
    
    -- Check Disk
    IF @DiskUsage >= @DiskCritical
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM ServerHealthAlerts 
            WHERE ServerId = @ServerId AND AlertType = 'Disk' AND Severity = 'Critical' AND Status = 'Active'
        )
        BEGIN
            INSERT INTO ServerHealthAlerts (
                ServerId, MetricId, AlertType, Severity,
                Title, Message, MetricName, CurrentValue, ThresholdValue
            )
            VALUES (
                @ServerId, @MetricId, 'Disk', 'Critical',
                'Critical Disk Usage on ' + @ServerName,
                'Disk usage has exceeded critical threshold. Current: ' + CAST(@DiskUsage AS NVARCHAR) + '%, Threshold: ' + CAST(@DiskCritical AS NVARCHAR) + '%',
                'Disk', @DiskUsage, @DiskCritical
            );
        END
    END
    ELSE IF @DiskUsage >= @DiskWarning
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM ServerHealthAlerts 
            WHERE ServerId = @ServerId AND AlertType = 'Disk' AND Severity = 'Warning' AND Status = 'Active'
        )
        BEGIN
            INSERT INTO ServerHealthAlerts (
                ServerId, MetricId, AlertType, Severity,
                Title, Message, MetricName, CurrentValue, ThresholdValue
            )
            VALUES (
                @ServerId, @MetricId, 'Disk', 'Warning',
                'High Disk Usage on ' + @ServerName,
                'Disk usage has exceeded warning threshold. Current: ' + CAST(@DiskUsage AS NVARCHAR) + '%, Threshold: ' + CAST(@DiskWarning AS NVARCHAR) + '%',
                'Disk', @DiskUsage, @DiskWarning
            );
        END
    END
END
GO

-- =============================================
-- SP: Get Latest Server Health Metrics
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetLatestServerHealthMetrics')
    DROP PROCEDURE sp_GetLatestServerHealthMetrics;
GO

CREATE PROCEDURE sp_GetLatestServerHealthMetrics
    @ServerId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    ;WITH LatestMetrics AS (
        SELECT 
            ServerId,
            MAX(RecordedAt) AS LatestRecordedAt
        FROM ServerHealthMetrics
        WHERE (@ServerId IS NULL OR ServerId = @ServerId)
        GROUP BY ServerId
    )
    SELECT 
        m.MetricId, m.ServerId, s.ServerName, s.ServerType,
        m.CPUUsagePercent, m.MemoryUsagePercent, m.MemoryUsedGB, m.MemoryTotalGB,
        m.DiskUsagePercent, m.DiskUsedGB, m.DiskTotalGB,
        m.NetworkInMbps, m.NetworkOutMbps, m.UptimeDays, m.ActiveConnections,
        m.HealthStatus, m.ResponseTimeMs, m.IsReachable, m.ErrorMessage,
        m.RecordedAt
    FROM ServerHealthMetrics m
    INNER JOIN LatestMetrics lm ON m.ServerId = lm.ServerId AND m.RecordedAt = lm.LatestRecordedAt
    INNER JOIN Servers s ON m.ServerId = s.ServerId
    ORDER BY m.HealthStatus DESC, m.ServerId;
END
GO

-- =============================================
-- SP: Get Server Health History
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetServerHealthHistory')
    DROP PROCEDURE sp_GetServerHealthHistory;
GO

CREATE PROCEDURE sp_GetServerHealthHistory
    @ServerId INT,
    @StartDate DATETIME2 = NULL,
    @EndDate DATETIME2 = NULL,
    @MaxRecords INT = 1000
AS
BEGIN
    SET NOCOUNT ON;
    
    SET @StartDate = ISNULL(@StartDate, DATEADD(DAY, -7, GETUTCDATE()));
    SET @EndDate = ISNULL(@EndDate, GETUTCDATE());
    
    SELECT TOP (@MaxRecords)
        MetricId, ServerId,
        CPUUsagePercent, MemoryUsagePercent, DiskUsagePercent,
        MemoryUsedGB, MemoryTotalGB, DiskUsedGB, DiskTotalGB,
        NetworkInMbps, NetworkOutMbps, UptimeDays, ActiveConnections,
        HealthStatus, ResponseTimeMs, IsReachable, ErrorMessage,
        RecordedAt
    FROM ServerHealthMetrics
    WHERE ServerId = @ServerId
        AND RecordedAt BETWEEN @StartDate AND @EndDate
    ORDER BY RecordedAt DESC;
END
GO

-- =============================================
-- SP: Get Active Health Alerts
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetActiveHealthAlerts')
    DROP PROCEDURE sp_GetActiveHealthAlerts;
GO

CREATE PROCEDURE sp_GetActiveHealthAlerts
    @ServerId INT = NULL,
    @Severity NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        a.AlertId, a.ServerId, s.ServerName, s.ServerType,
        a.AlertType, a.Severity, a.Title, a.Message,
        a.MetricName, a.CurrentValue, a.ThresholdValue,
        a.Status, a.EmailSent, a.EmailSentAt,
        a.AcknowledgedAt, a.AcknowledgedBy,
        a.ResolvedAt, a.ResolvedBy,
        a.CreatedAt
    FROM ServerHealthAlerts a
    INNER JOIN Servers s ON a.ServerId = s.ServerId
    WHERE a.Status IN ('Active', 'Acknowledged')
        AND (@ServerId IS NULL OR a.ServerId = @ServerId)
        AND (@Severity IS NULL OR a.Severity = @Severity)
    ORDER BY a.Severity DESC, a.CreatedAt DESC;
END
GO

-- =============================================
-- SP: Acknowledge Health Alert
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_AcknowledgeHealthAlert')
    DROP PROCEDURE sp_AcknowledgeHealthAlert;
GO

CREATE PROCEDURE sp_AcknowledgeHealthAlert
    @AlertId BIGINT,
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE ServerHealthAlerts
    SET 
        Status = 'Acknowledged',
        AcknowledgedAt = GETUTCDATE(),
        AcknowledgedBy = @UserId
    WHERE AlertId = @AlertId AND Status = 'Active';
    
    SELECT * FROM ServerHealthAlerts WHERE AlertId = @AlertId;
END
GO

-- =============================================
-- SP: Resolve Health Alert
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_ResolveHealthAlert')
    DROP PROCEDURE sp_ResolveHealthAlert;
GO

CREATE PROCEDURE sp_ResolveHealthAlert
    @AlertId BIGINT,
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE ServerHealthAlerts
    SET 
        Status = 'Resolved',
        ResolvedAt = GETUTCDATE(),
        ResolvedBy = @UserId
    WHERE AlertId = @AlertId AND Status IN ('Active', 'Acknowledged');
    
    SELECT * FROM ServerHealthAlerts WHERE AlertId = @AlertId;
END
GO

-- =============================================
-- SP: Get Server Health Analytics
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetServerHealthAnalytics')
    DROP PROCEDURE sp_GetServerHealthAnalytics;
GO

CREATE PROCEDURE sp_GetServerHealthAnalytics
    @ServerId INT,
    @DaysBack INT = 7
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @StartDate DATETIME2 = DATEADD(DAY, -@DaysBack, GETUTCDATE());
    
    SELECT 
        -- Averages
        AVG(CPUUsagePercent) AS AvgCPU,
        AVG(MemoryUsagePercent) AS AvgMemory,
        AVG(DiskUsagePercent) AS AvgDisk,
        
        -- Peaks
        MAX(CPUUsagePercent) AS PeakCPU,
        MAX(MemoryUsagePercent) AS PeakMemory,
        MAX(DiskUsagePercent) AS PeakDisk,
        
        -- Minimums
        MIN(CPUUsagePercent) AS MinCPU,
        MIN(MemoryUsagePercent) AS MinMemory,
        MIN(DiskUsagePercent) AS MinDisk,
        
        -- Counts
        COUNT(*) AS TotalReadings,
        SUM(CASE WHEN HealthStatus = 'Critical' THEN 1 ELSE 0 END) AS CriticalCount,
        SUM(CASE WHEN HealthStatus = 'Warning' THEN 1 ELSE 0 END) AS WarningCount,
        SUM(CASE WHEN HealthStatus = 'Healthy' THEN 1 ELSE 0 END) AS HealthyCount,
        SUM(CASE WHEN IsReachable = 0 THEN 1 ELSE 0 END) AS OfflineCount,
        
        -- Availability
        CAST((SUM(CASE WHEN IsReachable = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) AS DECIMAL(5,2)) AS UptimePercentage
    FROM ServerHealthMetrics
    WHERE ServerId = @ServerId
        AND RecordedAt >= @StartDate;
END
GO

PRINT '✅ Server Health stored procedures created successfully!';
GO