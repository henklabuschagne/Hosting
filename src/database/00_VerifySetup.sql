-- =============================================
-- Hosting Platform Management System
-- Setup Verification Script
-- =============================================

USE master;
GO

PRINT '========================================';
PRINT 'HOSTING PLATFORM SETUP VERIFICATION';
PRINT '========================================';
PRINT '';

-- Check if database exists
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'HostingPlatformDB')
BEGIN
    PRINT '✓ Database exists: HostingPlatformDB';
    PRINT '';
END
ELSE
BEGIN
    PRINT '✗ ERROR: Database HostingPlatformDB does not exist!';
    PRINT 'Please execute 01_CreateTables.sql first.';
    PRINT '';
    RETURN;
END

USE HostingPlatformDB;
GO

-- Check Tables
PRINT '--- CHECKING TABLES ---';
DECLARE @TableCount INT;
SET @TableCount = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE');

IF @TableCount >= 8
BEGIN
    PRINT '✓ All tables created (' + CAST(@TableCount AS VARCHAR) + ' tables)';
    
    -- List all tables
    SELECT TABLE_NAME AS 'Table Name', 
           CASE WHEN EXISTS (SELECT 1 FROM sys.tables t WHERE t.name = TABLE_NAME) THEN '✓' ELSE '✗' END AS 'Status'
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_TYPE = 'BASE TABLE'
    ORDER BY TABLE_NAME;
END
ELSE
BEGIN
    PRINT '✗ ERROR: Missing tables. Found ' + CAST(@TableCount AS VARCHAR) + ' tables, expected 8+';
END
PRINT '';

-- Check Stored Procedures
PRINT '--- CHECKING STORED PROCEDURES ---';
DECLARE @ProcCount INT;
SET @ProcCount = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'PROCEDURE');

IF @ProcCount >= 30
BEGIN
    PRINT '✓ Stored procedures created (' + CAST(@ProcCount AS VARCHAR) + ' procedures)';
    
    -- Show procedure categories
    SELECT 
        CASE 
            WHEN ROUTINE_NAME LIKE '%User%' OR ROUTINE_NAME LIKE '%Login%' THEN 'Authentication'
            WHEN ROUTINE_NAME LIKE '%Client%' THEN 'Client Management'
            WHEN ROUTINE_NAME LIKE '%Server%' THEN 'Server Management'
            WHEN ROUTINE_NAME LIKE '%Tier%' THEN 'Tier Management'
            WHEN ROUTINE_NAME LIKE '%Request%' THEN 'Request Management'
            WHEN ROUTINE_NAME LIKE '%Dashboard%' OR ROUTINE_NAME LIKE '%Revenue%' OR ROUTINE_NAME LIKE '%Distribution%' OR ROUTINE_NAME LIKE '%Utilization%' OR ROUTINE_NAME LIKE '%Capacity%' THEN 'Analytics'
            ELSE 'Other'
        END AS Category,
        COUNT(*) AS Count
    FROM INFORMATION_SCHEMA.ROUTINES 
    WHERE ROUTINE_TYPE = 'PROCEDURE'
    GROUP BY 
        CASE 
            WHEN ROUTINE_NAME LIKE '%User%' OR ROUTINE_NAME LIKE '%Login%' THEN 'Authentication'
            WHEN ROUTINE_NAME LIKE '%Client%' THEN 'Client Management'
            WHEN ROUTINE_NAME LIKE '%Server%' THEN 'Server Management'
            WHEN ROUTINE_NAME LIKE '%Tier%' THEN 'Tier Management'
            WHEN ROUTINE_NAME LIKE '%Request%' THEN 'Request Management'
            WHEN ROUTINE_NAME LIKE '%Dashboard%' OR ROUTINE_NAME LIKE '%Revenue%' OR ROUTINE_NAME LIKE '%Distribution%' OR ROUTINE_NAME LIKE '%Utilization%' OR ROUTINE_NAME LIKE '%Capacity%' THEN 'Analytics'
            ELSE 'Other'
        END
    ORDER BY Category;
END
ELSE
BEGIN
    PRINT '✗ WARNING: Only ' + CAST(@ProcCount AS VARCHAR) + ' procedures found, expected 30+';
    PRINT 'Please execute stored procedure scripts (03-08).';
END
PRINT '';

-- Check Seed Data
PRINT '--- CHECKING SEED DATA ---';

DECLARE @UserCount INT = (SELECT COUNT(*) FROM Users);
DECLARE @TierCount INT = (SELECT COUNT(*) FROM ServerTiers);
DECLARE @ServerCount INT = (SELECT COUNT(*) FROM Servers);
DECLARE @ClientCount INT = (SELECT COUNT(*) FROM Clients);
DECLARE @AssignmentCount INT = (SELECT COUNT(*) FROM ClientServerAssignments);

IF @UserCount > 0
    PRINT '✓ Users: ' + CAST(@UserCount AS VARCHAR) + ' records';
ELSE
    PRINT '✗ WARNING: No users found. Execute 02_SeedData.sql';

IF @TierCount > 0
    PRINT '✓ Server Tiers: ' + CAST(@TierCount AS VARCHAR) + ' records';
ELSE
    PRINT '✗ WARNING: No tiers found. Execute 02_SeedData.sql';

IF @ServerCount > 0
    PRINT '✓ Servers: ' + CAST(@ServerCount AS VARCHAR) + ' records';
ELSE
    PRINT '✗ WARNING: No servers found. Execute 02_SeedData.sql';

IF @ClientCount > 0
    PRINT '✓ Clients: ' + CAST(@ClientCount AS VARCHAR) + ' records';
ELSE
    PRINT '✗ WARNING: No clients found. Execute 02_SeedData.sql';

IF @AssignmentCount > 0
    PRINT '✓ Client-Server Assignments: ' + CAST(@AssignmentCount AS VARCHAR) + ' records';
ELSE
    PRINT '✗ WARNING: No assignments found. Execute 02_SeedData.sql';

PRINT '';

-- Check Indexes
PRINT '--- CHECKING INDEXES ---';
DECLARE @IndexCount INT = (
    SELECT COUNT(*) 
    FROM sys.indexes 
    WHERE object_id > 100 AND is_primary_key = 0 AND is_unique_constraint = 0
);

IF @IndexCount > 0
    PRINT '✓ Indexes created: ' + CAST(@IndexCount AS VARCHAR);
ELSE
    PRINT '⚠ No additional indexes found (only primary keys)';

PRINT '';

-- Test Critical Stored Procedures
PRINT '--- TESTING STORED PROCEDURES ---';

BEGIN TRY
    -- Test Dashboard Stats
    DECLARE @TotalClients INT;
    EXEC sp_GetDashboardStats;
    PRINT '✓ sp_GetDashboardStats executed successfully';
END TRY
BEGIN CATCH
    PRINT '✗ ERROR: sp_GetDashboardStats failed - ' + ERROR_MESSAGE();
END CATCH

BEGIN TRY
    -- Test Get All Clients
    EXEC sp_GetAllClients;
    PRINT '✓ sp_GetAllClients executed successfully';
END TRY
BEGIN CATCH
    PRINT '✗ ERROR: sp_GetAllClients failed - ' + ERROR_MESSAGE();
END CATCH

BEGIN TRY
    -- Test Get All Servers
    EXEC sp_GetAllServers;
    PRINT '✓ sp_GetAllServers executed successfully';
END TRY
BEGIN CATCH
    PRINT '✗ ERROR: sp_GetAllServers failed - ' + ERROR_MESSAGE();
END CATCH

BEGIN TRY
    -- Test Get All Tiers
    EXEC sp_GetAllServerTiers;
    PRINT '✓ sp_GetAllServerTiers executed successfully';
END TRY
BEGIN CATCH
    PRINT '✗ ERROR: sp_GetAllServerTiers failed - ' + ERROR_MESSAGE();
END CATCH

PRINT '';

-- Database Size
PRINT '--- DATABASE SIZE ---';
EXEC sp_spaceused;
PRINT '';

-- Summary
PRINT '========================================';
PRINT 'VERIFICATION SUMMARY';
PRINT '========================================';

IF @TableCount >= 8 AND @ProcCount >= 30 AND @UserCount > 0 AND @TierCount > 0 AND @ServerCount > 0 AND @ClientCount > 0
BEGIN
    PRINT '✓ ✓ ✓ DATABASE SETUP COMPLETE! ✓ ✓ ✓';
    PRINT '';
    PRINT 'Next Steps:';
    PRINT '1. Start Backend API: cd backend/HostingPlatform.API && dotnet run';
    PRINT '2. Start Frontend: npm run dev';
    PRINT '3. Login with: admin / Password123!';
    PRINT '';
    PRINT 'API Documentation: http://localhost:5000/swagger';
    PRINT 'Frontend App: http://localhost:5173';
END
ELSE
BEGIN
    PRINT '⚠ SETUP INCOMPLETE - Review errors above';
    PRINT '';
    PRINT 'Execute scripts in this order:';
    PRINT '1. database/01_CreateTables.sql';
    PRINT '2. database/02_SeedData.sql';
    PRINT '3. database/03_StoredProcedures_Auth.sql';
    PRINT '4. database/04_StoredProcedures_Clients.sql';
    PRINT '5. database/05_StoredProcedures_Servers.sql';
    PRINT '6. database/06_StoredProcedures_Tiers.sql';
    PRINT '7. database/07_StoredProcedures_Requests.sql';
    PRINT '8. database/08_StoredProcedures_Analytics.sql';
END

PRINT '';
PRINT '========================================';
GO
