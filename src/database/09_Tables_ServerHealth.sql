-- =============================================
-- Server Health Monitoring Tables
-- =============================================

USE HostingPlatformDB;
GO

-- =============================================
-- Table: ServerHealthThresholds
-- Stores threshold configuration for each server
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'ServerHealthThresholds') AND type = 'U')
BEGIN
    CREATE TABLE ServerHealthThresholds (
        ThresholdId INT IDENTITY(1,1) PRIMARY KEY,
        ServerId INT NOT NULL,
        
        -- CPU Thresholds (percentage)
        CPUWarningThreshold DECIMAL(5,2) NOT NULL DEFAULT 70.00,
        CPUCriticalThreshold DECIMAL(5,2) NOT NULL DEFAULT 90.00,
        
        -- Memory Thresholds (percentage)
        MemoryWarningThreshold DECIMAL(5,2) NOT NULL DEFAULT 75.00,
        MemoryCriticalThreshold DECIMAL(5,2) NOT NULL DEFAULT 90.00,
        
        -- Disk Space Thresholds (percentage)
        DiskWarningThreshold DECIMAL(5,2) NOT NULL DEFAULT 80.00,
        DiskCriticalThreshold DECIMAL(5,2) NOT NULL DEFAULT 95.00,
        
        -- Health Check Configuration
        HealthCheckUrl NVARCHAR(500) NULL,
        HealthCheckEnabled BIT NOT NULL DEFAULT 1,
        CheckIntervalMinutes INT NOT NULL DEFAULT 60,
        
        -- Alert Configuration
        EmailAlertsEnabled BIT NOT NULL DEFAULT 1,
        AlertEmailAddresses NVARCHAR(1000) NULL,
        
        CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        ModifiedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CreatedBy INT NULL,
        ModifiedBy INT NULL,
        
        CONSTRAINT FK_ServerHealthThresholds_Server FOREIGN KEY (ServerId) REFERENCES Servers(ServerId) ON DELETE CASCADE,
        CONSTRAINT CK_CPUThresholds CHECK (CPUWarningThreshold < CPUCriticalThreshold),
        CONSTRAINT CK_MemoryThresholds CHECK (MemoryWarningThreshold < MemoryCriticalThreshold),
        CONSTRAINT CK_DiskThresholds CHECK (DiskWarningThreshold < DiskCriticalThreshold)
    );
    
    CREATE UNIQUE INDEX UX_ServerHealthThresholds_ServerId ON ServerHealthThresholds(ServerId);
    CREATE INDEX IX_ServerHealthThresholds_HealthCheckEnabled ON ServerHealthThresholds(HealthCheckEnabled);
    
    PRINT '✅ Created ServerHealthThresholds table';
END
GO

-- =============================================
-- Table: ServerHealthMetrics
-- Stores historical health data for each server
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'ServerHealthMetrics') AND type = 'U')
BEGIN
    CREATE TABLE ServerHealthMetrics (
        MetricId BIGINT IDENTITY(1,1) PRIMARY KEY,
        ServerId INT NOT NULL,
        
        -- Resource Usage
        CPUUsagePercent DECIMAL(5,2) NOT NULL,
        MemoryUsagePercent DECIMAL(5,2) NOT NULL,
        MemoryUsedGB DECIMAL(10,2) NOT NULL,
        MemoryTotalGB DECIMAL(10,2) NOT NULL,
        DiskUsagePercent DECIMAL(5,2) NOT NULL,
        DiskUsedGB DECIMAL(10,2) NOT NULL,
        DiskTotalGB DECIMAL(10,2) NOT NULL,
        
        -- Network Stats
        NetworkInMbps DECIMAL(10,2) NULL,
        NetworkOutMbps DECIMAL(10,2) NULL,
        
        -- System Info
        UptimeDays DECIMAL(10,2) NULL,
        ActiveConnections INT NULL,
        
        -- Health Status
        HealthStatus NVARCHAR(50) NOT NULL DEFAULT 'Healthy',
        ResponseTimeMs INT NULL,
        IsReachable BIT NOT NULL DEFAULT 1,
        ErrorMessage NVARCHAR(MAX) NULL,
        
        -- Timestamps
        RecordedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT FK_ServerHealthMetrics_Server FOREIGN KEY (ServerId) REFERENCES Servers(ServerId) ON DELETE CASCADE,
        CONSTRAINT CK_HealthStatus CHECK (HealthStatus IN ('Healthy', 'Warning', 'Critical', 'Offline'))
    );
    
    CREATE INDEX IX_ServerHealthMetrics_ServerId_RecordedAt ON ServerHealthMetrics(ServerId, RecordedAt DESC);
    CREATE INDEX IX_ServerHealthMetrics_RecordedAt ON ServerHealthMetrics(RecordedAt DESC);
    CREATE INDEX IX_ServerHealthMetrics_HealthStatus ON ServerHealthMetrics(HealthStatus);
    
    PRINT '✅ Created ServerHealthMetrics table';
END
GO

-- =============================================
-- Table: ServerHealthAlerts
-- Stores health alerts and notifications
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'ServerHealthAlerts') AND type = 'U')
BEGIN
    CREATE TABLE ServerHealthAlerts (
        AlertId BIGINT IDENTITY(1,1) PRIMARY KEY,
        ServerId INT NOT NULL,
        MetricId BIGINT NULL,
        
        -- Alert Details
        AlertType NVARCHAR(50) NOT NULL,
        Severity NVARCHAR(50) NOT NULL,
        Title NVARCHAR(200) NOT NULL,
        Message NVARCHAR(MAX) NOT NULL,
        
        -- Metric Values
        MetricName NVARCHAR(50) NOT NULL,
        CurrentValue DECIMAL(10,2) NOT NULL,
        ThresholdValue DECIMAL(10,2) NOT NULL,
        
        -- Alert Status
        Status NVARCHAR(50) NOT NULL DEFAULT 'Active',
        AcknowledgedAt DATETIME2 NULL,
        AcknowledgedBy INT NULL,
        ResolvedAt DATETIME2 NULL,
        ResolvedBy INT NULL,
        
        -- Notification
        EmailSent BIT NOT NULL DEFAULT 0,
        EmailSentAt DATETIME2 NULL,
        
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT FK_ServerHealthAlerts_Server FOREIGN KEY (ServerId) REFERENCES Servers(ServerId) ON DELETE CASCADE,
        CONSTRAINT FK_ServerHealthAlerts_Metric FOREIGN KEY (MetricId) REFERENCES ServerHealthMetrics(MetricId),
        CONSTRAINT CK_AlertType CHECK (AlertType IN ('CPU', 'Memory', 'Disk', 'Network', 'Offline', 'Custom')),
        CONSTRAINT CK_Severity CHECK (Severity IN ('Warning', 'Critical', 'Info')),
        CONSTRAINT CK_AlertStatus CHECK (Status IN ('Active', 'Acknowledged', 'Resolved', 'Expired'))
    );
    
    CREATE INDEX IX_ServerHealthAlerts_ServerId_Status ON ServerHealthAlerts(ServerId, Status);
    CREATE INDEX IX_ServerHealthAlerts_Status_CreatedAt ON ServerHealthAlerts(Status, CreatedAt DESC);
    CREATE INDEX IX_ServerHealthAlerts_Severity ON ServerHealthAlerts(Severity);
    
    PRINT '✅ Created ServerHealthAlerts table';
END
GO

-- =============================================
-- Table: ServerHealthCheckLog
-- Logs each health check attempt
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'ServerHealthCheckLog') AND type = 'U')
BEGIN
    CREATE TABLE ServerHealthCheckLog (
        LogId BIGINT IDENTITY(1,1) PRIMARY KEY,
        ServerId INT NOT NULL,
        
        CheckStartedAt DATETIME2 NOT NULL,
        CheckCompletedAt DATETIME2 NULL,
        DurationMs INT NULL,
        
        Success BIT NOT NULL,
        ErrorMessage NVARCHAR(MAX) NULL,
        HttpStatusCode INT NULL,
        
        MetricsCollected BIT NOT NULL DEFAULT 0,
        AlertsGenerated INT NOT NULL DEFAULT 0,
        
        CONSTRAINT FK_ServerHealthCheckLog_Server FOREIGN KEY (ServerId) REFERENCES Servers(ServerId) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_ServerHealthCheckLog_ServerId_CheckStartedAt ON ServerHealthCheckLog(ServerId, CheckStartedAt DESC);
    CREATE INDEX IX_ServerHealthCheckLog_Success ON ServerHealthCheckLog(Success);
    
    PRINT '✅ Created ServerHealthCheckLog table';
END
GO

PRINT '';
PRINT '✅ Server Health Monitoring tables created successfully!';
GO
