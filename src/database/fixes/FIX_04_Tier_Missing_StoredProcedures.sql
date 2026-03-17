-- =============================================
-- FIX SCRIPT #4: Missing Tier Management Stored Procedures
-- Issue: TIER-001, TIER-002, TIER-003
-- Description: Creates 3 missing stored procedures for tier management
-- =============================================

USE HostingPlatformDB;
GO

-- =============================================
-- SP: Get Server Tier By Name
-- Issue: TIER-001
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetServerTierByName')
    DROP PROCEDURE sp_GetServerTierByName;
GO

CREATE PROCEDURE sp_GetServerTierByName
    @TierName NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        TierId,
        TierName,
        DisplayName,
        MaxEntities,
        MaxTemplates,
        MaxUsers,
        PricePerMonth,
        Description,
        IsActive,
        CreatedDate,
        ModifiedDate
    FROM ServerTiers
    WHERE TierName = @TierName;
END
GO

-- =============================================
-- SP: Get Tier Specs By Tier ID
-- Issue: TIER-002
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetTierSpecsByTierId')
    DROP PROCEDURE sp_GetTierSpecsByTierId;
GO

CREATE PROCEDURE sp_GetTierSpecsByTierId
    @TierId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        SpecId,
        TierId,
        ServerType,
        CPUCores,
        RamGB,
        StorageGB,
        BackupEnabled,
        BackupFrequency,
        BackupRetentionDays,
        BandwidthMbps,
        PublicIPIncluded,
        MaxEntities,
        MaxTemplates,
        MaxUsers,
        MonthlyPrice,
        CreatedDate,
        ModifiedDate
    FROM ServerTierSpecs
    WHERE TierId = @TierId
    ORDER BY ServerType;
END
GO

-- =============================================
-- SP: Get All Tier Configurations
-- Issue: TIER-003
-- Returns multiple result sets: Tiers and Specs
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetAllTierConfigurations')
    DROP PROCEDURE sp_GetAllTierConfigurations;
GO

CREATE PROCEDURE sp_GetAllTierConfigurations
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Result Set 1: All Tiers
    SELECT 
        TierId,
        TierName,
        DisplayName,
        MaxEntities,
        MaxTemplates,
        MaxUsers,
        PricePerMonth,
        Description,
        IsActive,
        CreatedDate,
        ModifiedDate
    FROM ServerTiers
    WHERE IsActive = 1
    ORDER BY PricePerMonth;
    
    -- Result Set 2: All Specs for those Tiers
    SELECT 
        SpecId,
        TierId,
        ServerType,
        CPUCores,
        RamGB,
        StorageGB,
        BackupEnabled,
        BackupFrequency,
        BackupRetentionDays,
        BandwidthMbps,
        PublicIPIncluded,
        MaxEntities,
        MaxTemplates,
        MaxUsers,
        MonthlyPrice,
        CreatedDate,
        ModifiedDate
    FROM ServerTierSpecs
    WHERE TierId IN (
        SELECT TierId FROM ServerTiers WHERE IsActive = 1
    )
    ORDER BY TierId, ServerType;
END
GO

PRINT '✅ FIX #4 COMPLETE: Created 3 missing tier stored procedures';
PRINT '   - sp_GetServerTierByName';
PRINT '   - sp_GetTierSpecsByTierId';
PRINT '   - sp_GetAllTierConfigurations';
GO
