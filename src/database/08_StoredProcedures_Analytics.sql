-- =============================================
-- Analytics & Dashboard Stored Procedures
-- =============================================

USE HostingPlatformDB;
GO

-- =============================================
-- SP: Get Dashboard Statistics
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetDashboardStats')
    DROP PROCEDURE sp_GetDashboardStats;
GO

CREATE PROCEDURE sp_GetDashboardStats
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Total Clients
    DECLARE @TotalClients INT = (SELECT COUNT(*) FROM Clients);
    DECLARE @ActiveClients INT = (SELECT COUNT(*) FROM Clients WHERE Status = 'active');
    DECLARE @SuspendedClients INT = (SELECT COUNT(*) FROM Clients WHERE Status = 'suspended');
    
    -- Total Servers
    DECLARE @TotalServers INT = (SELECT COUNT(*) FROM Servers);
    DECLARE @ActiveServers INT = (SELECT COUNT(*) FROM Servers WHERE Status = 'Active');
    
    -- Revenue
    DECLARE @TotalRevenue DECIMAL(10,2) = (
        SELECT ISNULL(SUM(ActualMonthlyFee), 0) 
        FROM Clients 
        WHERE Status = 'active'
    );
    
    -- Pending Requests
    DECLARE @PendingRequests INT = (
        SELECT COUNT(*) 
        FROM TierRecommendationRequests 
        WHERE Status = 'pending'
    );
    
    -- Return statistics
    SELECT 
        @TotalClients AS TotalClients,
        @ActiveClients AS ActiveClients,
        @SuspendedClients AS SuspendedClients,
        @TotalServers AS TotalServers,
        @ActiveServers AS ActiveServers,
        @TotalRevenue AS TotalRevenue,
        @PendingRequests AS PendingRequests;
END
GO

-- =============================================
-- SP: Get Capacity Overview
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetCapacityOverview')
    DROP PROCEDURE sp_GetCapacityOverview;
GO

CREATE PROCEDURE sp_GetCapacityOverview
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        s.ServerId,
        s.ServerName,
        s.ServerType,
        s.MaxEntities,
        s.MaxTemplates,
        s.MaxUsers,
        ISNULL(SUM(CASE WHEN c.Status = 'active' THEN c.CurrentEntities ELSE 0 END), 0) AS UsedEntities,
        ISNULL(SUM(CASE WHEN c.Status = 'active' THEN c.CurrentTemplates ELSE 0 END), 0) AS UsedTemplates,
        ISNULL(SUM(CASE WHEN c.Status = 'active' THEN c.CurrentUsers ELSE 0 END), 0) AS UsedUsers,
        CAST(ISNULL(SUM(CASE WHEN c.Status = 'active' THEN c.CurrentEntities ELSE 0 END) * 100.0 / NULLIF(s.MaxEntities, 0), 0) AS DECIMAL(5,2)) AS EntitiesPercent,
        CAST(ISNULL(SUM(CASE WHEN c.Status = 'active' THEN c.CurrentTemplates ELSE 0 END) * 100.0 / NULLIF(s.MaxTemplates, 0), 0) AS DECIMAL(5,2)) AS TemplatesPercent,
        CAST(ISNULL(SUM(CASE WHEN c.Status = 'active' THEN c.CurrentUsers ELSE 0 END) * 100.0 / NULLIF(s.MaxUsers, 0), 0) AS DECIMAL(5,2)) AS UsersPercent
    FROM Servers s
    LEFT JOIN ClientServerAssignments csa ON s.ServerId = csa.ServerId AND csa.IsActive = 1
    LEFT JOIN Clients c ON csa.ClientId = c.ClientId
    WHERE s.Status = 'Active'
    GROUP BY s.ServerId, s.ServerName, s.ServerType, s.MaxEntities, s.MaxTemplates, s.MaxUsers
    ORDER BY s.ServerName;
END
GO

-- =============================================
-- SP: Get Revenue by Tier
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetRevenueByTier')
    DROP PROCEDURE sp_GetRevenueByTier;
GO

CREATE PROCEDURE sp_GetRevenueByTier
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        t.TierName,
        t.DisplayName,
        COUNT(c.ClientId) AS ClientCount,
        ISNULL(SUM(CASE WHEN c.Status = 'active' THEN c.ActualMonthlyFee ELSE 0 END), 0) AS TotalRevenue,
        ISNULL(AVG(CASE WHEN c.Status = 'active' THEN c.ActualMonthlyFee ELSE NULL END), 0) AS AverageRevenue,
        t.PricePerMonth AS StandardPrice
    FROM ServerTiers t
    LEFT JOIN Clients c ON t.TierId = c.TierId
    WHERE t.IsActive = 1
    GROUP BY t.TierName, t.DisplayName, t.PricePerMonth
    ORDER BY t.PricePerMonth;
END
GO

-- =============================================
-- SP: Get Client Distribution
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetClientDistribution')
    DROP PROCEDURE sp_GetClientDistribution;
GO

CREATE PROCEDURE sp_GetClientDistribution
AS
BEGIN
    SET NOCOUNT ON;
    
    -- By Tier
    SELECT 
        'ByTier' AS DistributionType,
        t.DisplayName AS Category,
        COUNT(c.ClientId) AS Count
    FROM ServerTiers t
    LEFT JOIN Clients c ON t.TierId = c.TierId
    WHERE t.IsActive = 1
    GROUP BY t.DisplayName
    
    UNION ALL
    
    -- By Hosting Type
    SELECT 
        'ByHostingType' AS DistributionType,
        c.HostingType AS Category,
        COUNT(c.ClientId) AS Count
    FROM Clients c
    GROUP BY c.HostingType
    
    UNION ALL
    
    -- By Status
    SELECT 
        'ByStatus' AS DistributionType,
        c.Status AS Category,
        COUNT(c.ClientId) AS Count
    FROM Clients c
    GROUP BY c.Status
    
    ORDER BY DistributionType, Category;
END
GO

-- =============================================
-- SP: Get Top Clients by Usage
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetTopClientsByUsage')
    DROP PROCEDURE sp_GetTopClientsByUsage;
GO

CREATE PROCEDURE sp_GetTopClientsByUsage
    @TopN INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP (@TopN)
        c.ClientId,
        c.ClientName,
        c.CurrentEntities,
        c.CurrentTemplates,
        c.CurrentUsers,
        (c.CurrentEntities + c.CurrentTemplates + c.CurrentUsers) AS TotalUsage,
        c.ActualMonthlyFee,
        t.DisplayName AS TierName,
        c.Status
    FROM Clients c
    INNER JOIN ServerTiers t ON c.TierId = t.TierId
    ORDER BY (c.CurrentEntities + c.CurrentTemplates + c.CurrentUsers) DESC;
END
GO

-- =============================================
-- SP: Get Server Utilization Report
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetServerUtilizationReport')
    DROP PROCEDURE sp_GetServerUtilizationReport;
GO

CREATE PROCEDURE sp_GetServerUtilizationReport
AS
BEGIN
    SET NOCOUNT ON;
    
    WITH ServerUtilization AS (
        SELECT 
            s.ServerId,
            s.ServerName,
            s.ServerType,
            t.DisplayName AS TierName,
            s.MaxEntities,
            s.MaxTemplates,
            s.MaxUsers,
            ISNULL(SUM(CASE WHEN c.Status = 'active' THEN c.CurrentEntities ELSE 0 END), 0) AS UsedEntities,
            ISNULL(SUM(CASE WHEN c.Status = 'active' THEN c.CurrentTemplates ELSE 0 END), 0) AS UsedTemplates,
            ISNULL(SUM(CASE WHEN c.Status = 'active' THEN c.CurrentUsers ELSE 0 END), 0) AS UsedUsers,
            COUNT(DISTINCT CASE WHEN csa.IsActive = 1 AND c.Status = 'active' THEN c.ClientId END) AS ActiveClients
        FROM Servers s
        INNER JOIN ServerTiers t ON s.TierId = t.TierId
        LEFT JOIN ClientServerAssignments csa ON s.ServerId = csa.ServerId
        LEFT JOIN Clients c ON csa.ClientId = c.ClientId
        WHERE s.Status = 'Active'
        GROUP BY s.ServerId, s.ServerName, s.ServerType, t.DisplayName,
                 s.MaxEntities, s.MaxTemplates, s.MaxUsers
    )
    SELECT 
        ServerId,
        ServerName,
        ServerType,
        TierName,
        ActiveClients,
        MaxEntities,
        UsedEntities,
        MaxEntities - UsedEntities AS AvailableEntities,
        CAST(UsedEntities * 100.0 / NULLIF(MaxEntities, 0) AS DECIMAL(5,2)) AS EntitiesUtilization,
        MaxTemplates,
        UsedTemplates,
        MaxTemplates - UsedTemplates AS AvailableTemplates,
        CAST(UsedTemplates * 100.0 / NULLIF(MaxTemplates, 0) AS DECIMAL(5,2)) AS TemplatesUtilization,
        MaxUsers,
        UsedUsers,
        MaxUsers - UsedUsers AS AvailableUsers,
        CAST(UsedUsers * 100.0 / NULLIF(MaxUsers, 0) AS DECIMAL(5,2)) AS UsersUtilization,
        CAST((
            (UsedEntities * 100.0 / NULLIF(MaxEntities, 0)) +
            (UsedTemplates * 100.0 / NULLIF(MaxTemplates, 0)) +
            (UsedUsers * 100.0 / NULLIF(MaxUsers, 0))
        ) / 3 AS DECIMAL(5,2)) AS AverageUtilization,
        CASE 
            WHEN CAST((
                (UsedEntities * 100.0 / NULLIF(MaxEntities, 0)) +
                (UsedTemplates * 100.0 / NULLIF(MaxTemplates, 0)) +
                (UsedUsers * 100.0 / NULLIF(MaxUsers, 0))
            ) / 3 AS DECIMAL(5,2)) >= 90 THEN 'Critical'
            WHEN CAST((
                (UsedEntities * 100.0 / NULLIF(MaxEntities, 0)) +
                (UsedTemplates * 100.0 / NULLIF(MaxTemplates, 0)) +
                (UsedUsers * 100.0 / NULLIF(MaxUsers, 0))
            ) / 3 AS DECIMAL(5,2)) >= 80 THEN 'Warning'
            WHEN CAST((
                (UsedEntities * 100.0 / NULLIF(MaxEntities, 0)) +
                (UsedTemplates * 100.0 / NULLIF(MaxTemplates, 0)) +
                (UsedUsers * 100.0 / NULLIF(MaxUsers, 0))
            ) / 3 AS DECIMAL(5,2)) >= 40 THEN 'Healthy'
            ELSE 'Underutilized'
        END AS HealthStatus
    FROM ServerUtilization
    ORDER BY AverageUtilization DESC;
END
GO

-- =============================================
-- SP: Get Monthly Revenue Trend
-- (Mock data for last 6 months)
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetMonthlyRevenueTrend')
    DROP PROCEDURE sp_GetMonthlyRevenueTrend;
GO

CREATE PROCEDURE sp_GetMonthlyRevenueTrend
    @Months INT = 6
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CurrentRevenue DECIMAL(10,2) = (
        SELECT ISNULL(SUM(ActualMonthlyFee), 0)
        FROM Clients
        WHERE Status = 'active'
    );
    
    -- Generate trend data (simulated)
    WITH MonthSequence AS (
        SELECT 0 AS MonthOffset
        UNION ALL
        SELECT MonthOffset + 1
        FROM MonthSequence
        WHERE MonthOffset < @Months - 1
    )
    SELECT 
        DATEADD(MONTH, -MonthOffset, GETDATE()) AS Month,
        DATENAME(MONTH, DATEADD(MONTH, -MonthOffset, GETDATE())) AS MonthName,
        CAST(@CurrentRevenue * (0.85 + (MonthOffset * 0.03)) AS DECIMAL(10,2)) AS Revenue
    FROM MonthSequence
    ORDER BY Month;
END
GO

PRINT 'Analytics stored procedures created successfully!';
GO
