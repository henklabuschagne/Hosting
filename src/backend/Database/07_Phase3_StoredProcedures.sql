-- =============================================
-- Phase 3: Stored Procedures for Server Management
-- =============================================

-- =============================================
-- SP: Get All Servers
-- =============================================
CREATE PROCEDURE sp_GetAllServers
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        s.ServerId,
        s.ServerName,
        s.TierId,
        t.TierName,
        t.DisplayName AS TierDisplayName,
        s.ServerType,
        s.HostingType,
        s.CpuCores,
        s.RamGB,
        s.StorageGB,
        s.Location,
        s.IpAddress,
        s.CurrentEntities,
        s.CurrentTemplates,
        s.CurrentUsers,
        s.Status,
        s.IsActive,
        s.CreatedDate,
        s.ModifiedDate,
        s.Notes
    FROM Servers s
    INNER JOIN ServerTiers t ON s.TierId = t.TierId
    WHERE s.IsActive = 1
    ORDER BY s.ServerName;
END
GO

-- =============================================
-- SP: Get Server By ID
-- =============================================
CREATE PROCEDURE sp_GetServerById
    @ServerId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        s.ServerId,
        s.ServerName,
        s.TierId,
        t.TierName,
        t.DisplayName AS TierDisplayName,
        s.ServerType,
        s.HostingType,
        s.CpuCores,
        s.RamGB,
        s.StorageGB,
        s.Location,
        s.IpAddress,
        s.CurrentEntities,
        s.CurrentTemplates,
        s.CurrentUsers,
        s.Status,
        s.IsActive,
        s.CreatedDate,
        s.ModifiedDate,
        s.Notes
    FROM Servers s
    INNER JOIN ServerTiers t ON s.TierId = t.TierId
    WHERE s.ServerId = @ServerId;
END
GO

-- =============================================
-- SP: Get Servers By Tier
-- =============================================
CREATE PROCEDURE sp_GetServersByTier
    @TierId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        s.ServerId,
        s.ServerName,
        s.TierId,
        t.TierName,
        t.DisplayName AS TierDisplayName,
        s.ServerType,
        s.HostingType,
        s.CpuCores,
        s.RamGB,
        s.StorageGB,
        s.Location,
        s.IpAddress,
        s.CurrentEntities,
        s.CurrentTemplates,
        s.CurrentUsers,
        s.Status,
        s.IsActive,
        s.CreatedDate,
        s.ModifiedDate,
        s.Notes
    FROM Servers s
    INNER JOIN ServerTiers t ON s.TierId = t.TierId
    WHERE s.TierId = @TierId AND s.IsActive = 1
    ORDER BY s.ServerName;
END
GO

-- =============================================
-- SP: Get Servers By Type
-- =============================================
CREATE PROCEDURE sp_GetServersByType
    @ServerType NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        s.ServerId,
        s.ServerName,
        s.TierId,
        t.TierName,
        t.DisplayName AS TierDisplayName,
        s.ServerType,
        s.HostingType,
        s.CpuCores,
        s.RamGB,
        s.StorageGB,
        s.Location,
        s.IpAddress,
        s.CurrentEntities,
        s.CurrentTemplates,
        s.CurrentUsers,
        s.Status,
        s.IsActive,
        s.CreatedDate,
        s.ModifiedDate,
        s.Notes
    FROM Servers s
    INNER JOIN ServerTiers t ON s.TierId = t.TierId
    WHERE s.ServerType = @ServerType AND s.IsActive = 1
    ORDER BY s.ServerName;
END
GO

-- =============================================
-- SP: Get Available Servers (for assignment)
-- =============================================
CREATE PROCEDURE sp_GetAvailableServers
    @TierId INT = NULL,
    @ServerType NVARCHAR(50) = NULL,
    @HostingType NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        s.ServerId,
        s.ServerName,
        s.TierId,
        t.TierName,
        t.DisplayName AS TierDisplayName,
        s.ServerType,
        s.HostingType,
        s.CpuCores,
        s.RamGB,
        s.StorageGB,
        s.Location,
        s.IpAddress,
        s.CurrentEntities,
        s.CurrentTemplates,
        s.CurrentUsers,
        s.Status,
        ts.MaxEntities,
        ts.MaxTemplates,
        ts.MaxUsers,
        -- Calculate available capacity
        (ts.MaxEntities - s.CurrentEntities) AS AvailableEntities,
        (ts.MaxTemplates - s.CurrentTemplates) AS AvailableTemplates,
        (ts.MaxUsers - s.CurrentUsers) AS AvailableUsers
    FROM Servers s
    INNER JOIN ServerTiers t ON s.TierId = t.TierId
    INNER JOIN ServerTierSpecs ts ON t.TierId = ts.TierId AND s.ServerType = ts.ServerType
    WHERE 
        s.IsActive = 1
        AND s.Status = 'active'
        AND (@TierId IS NULL OR s.TierId = @TierId)
        AND (@ServerType IS NULL OR s.ServerType = @ServerType)
        AND (@HostingType IS NULL OR s.HostingType = @HostingType)
    ORDER BY s.ServerName;
END
GO

-- =============================================
-- SP: Create Server
-- =============================================
CREATE PROCEDURE sp_CreateServer
    @ServerName NVARCHAR(100),
    @TierId INT,
    @ServerType NVARCHAR(50),
    @HostingType NVARCHAR(50),
    @CpuCores INT,
    @RamGB INT,
    @StorageGB INT,
    @Location NVARCHAR(100),
    @IpAddress NVARCHAR(50),
    @Status NVARCHAR(50),
    @Notes NVARCHAR(MAX),
    @CreatedByUserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ServerId INT;
    
    INSERT INTO Servers (
        ServerName, TierId, ServerType, HostingType,
        CpuCores, RamGB, StorageGB, Location, IpAddress,
        Status, Notes, CreatedByUserId, ModifiedByUserId
    )
    VALUES (
        @ServerName, @TierId, @ServerType, @HostingType,
        @CpuCores, @RamGB, @StorageGB, @Location, @IpAddress,
        @Status, @Notes, @CreatedByUserId, @CreatedByUserId
    );
    
    SET @ServerId = SCOPE_IDENTITY();
    
    -- Return created server
    EXEC sp_GetServerById @ServerId;
END
GO

-- =============================================
-- SP: Update Server
-- =============================================
CREATE PROCEDURE sp_UpdateServer
    @ServerId INT,
    @ServerName NVARCHAR(100),
    @Location NVARCHAR(100),
    @IpAddress NVARCHAR(50),
    @Status NVARCHAR(50),
    @Notes NVARCHAR(MAX),
    @ModifiedByUserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Servers
    SET 
        ServerName = @ServerName,
        Location = @Location,
        IpAddress = @IpAddress,
        Status = @Status,
        Notes = @Notes,
        ModifiedByUserId = @ModifiedByUserId,
        ModifiedDate = GETUTCDATE()
    WHERE ServerId = @ServerId;
    
    -- Return updated server
    EXEC sp_GetServerById @ServerId;
END
GO

-- =============================================
-- SP: Update Server Load
-- =============================================
CREATE PROCEDURE sp_UpdateServerLoad
    @ServerId INT,
    @CurrentEntities INT,
    @CurrentTemplates INT,
    @CurrentUsers INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Servers
    SET 
        CurrentEntities = @CurrentEntities,
        CurrentTemplates = @CurrentTemplates,
        CurrentUsers = @CurrentUsers,
        ModifiedDate = GETUTCDATE()
    WHERE ServerId = @ServerId;
    
    -- Return updated server
    EXEC sp_GetServerById @ServerId;
END
GO

-- =============================================
-- SP: Update Server Status
-- =============================================
CREATE PROCEDURE sp_UpdateServerStatus
    @ServerId INT,
    @Status NVARCHAR(50),
    @ModifiedByUserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Servers
    SET 
        Status = @Status,
        ModifiedByUserId = @ModifiedByUserId,
        ModifiedDate = GETUTCDATE()
    WHERE ServerId = @ServerId;
    
    -- Return updated server
    EXEC sp_GetServerById @ServerId;
END
GO

-- =============================================
-- SP: Delete Server (Soft Delete)
-- =============================================
CREATE PROCEDURE sp_DeleteServer
    @ServerId INT,
    @ModifiedByUserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Servers
    SET 
        IsActive = 0,
        ModifiedByUserId = @ModifiedByUserId,
        ModifiedDate = GETUTCDATE()
    WHERE ServerId = @ServerId;
END
GO

-- =============================================
-- SP: Get Server Statistics
-- =============================================
CREATE PROCEDURE sp_GetServerStatistics
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        COUNT(*) AS TotalServers,
        COUNT(CASE WHEN Status = 'active' THEN 1 END) AS ActiveServers,
        COUNT(CASE WHEN Status = 'maintenance' THEN 1 END) AS MaintenanceServers,
        COUNT(CASE WHEN Status = 'inactive' THEN 1 END) AS InactiveServers,
        COUNT(CASE WHEN ServerType = 'Application' THEN 1 END) AS ApplicationServers,
        COUNT(CASE WHEN ServerType = 'Database' THEN 1 END) AS DatabaseServers,
        COUNT(CASE WHEN HostingType = 'Shared' THEN 1 END) AS SharedServers,
        COUNT(CASE WHEN HostingType = 'Dedicated' THEN 1 END) AS DedicatedServers
    FROM Servers
    WHERE IsActive = 1;
END
GO

-- =============================================
-- SP: Get Server Capacity Summary
-- =============================================
CREATE PROCEDURE sp_GetServerCapacitySummary
    @ServerId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        s.ServerId,
        s.ServerName,
        s.ServerType,
        s.CurrentEntities,
        s.CurrentTemplates,
        s.CurrentUsers,
        ts.MaxEntities,
        ts.MaxTemplates,
        ts.MaxUsers,
        -- Calculate usage percentages
        CASE 
            WHEN ts.MaxEntities > 0 THEN (s.CurrentEntities * 100.0 / ts.MaxEntities)
            ELSE 0
        END AS EntitiesUsagePercent,
        CASE 
            WHEN ts.MaxTemplates > 0 THEN (s.CurrentTemplates * 100.0 / ts.MaxTemplates)
            ELSE 0
        END AS TemplatesUsagePercent,
        CASE 
            WHEN ts.MaxUsers > 0 THEN (s.CurrentUsers * 100.0 / ts.MaxUsers)
            ELSE 0
        END AS UsersUsagePercent
    FROM Servers s
    INNER JOIN ServerTierSpecs ts ON s.TierId = ts.TierId AND s.ServerType = ts.ServerType
    WHERE s.ServerId = @ServerId;
END
GO
