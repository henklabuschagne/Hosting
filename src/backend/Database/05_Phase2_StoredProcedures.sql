-- =============================================
-- Phase 2: Stored Procedures for Server Tier Configuration
-- =============================================

-- =============================================
-- SP: Get All Server Tiers
-- =============================================
CREATE PROCEDURE sp_GetAllServerTiers
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        t.TierId,
        t.TierName,
        t.DisplayName,
        t.Description,
        t.IsActive,
        t.CreatedDate,
        t.ModifiedDate,
        t.CreatedByUserId,
        t.ModifiedByUserId
    FROM ServerTiers t
    WHERE t.IsActive = 1
    ORDER BY 
        CASE t.TierName
            WHEN 'small' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'large' THEN 3
            ELSE 4
        END;
END
GO

-- =============================================
-- SP: Get Server Tier By ID
-- =============================================
CREATE PROCEDURE sp_GetServerTierById
    @TierId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        t.TierId,
        t.TierName,
        t.DisplayName,
        t.Description,
        t.IsActive,
        t.CreatedDate,
        t.ModifiedDate,
        t.CreatedByUserId,
        t.ModifiedByUserId
    FROM ServerTiers t
    WHERE t.TierId = @TierId;
END
GO

-- =============================================
-- SP: Get Server Tier By Name
-- =============================================
CREATE PROCEDURE sp_GetServerTierByName
    @TierName NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        t.TierId,
        t.TierName,
        t.DisplayName,
        t.Description,
        t.IsActive,
        t.CreatedDate,
        t.ModifiedDate,
        t.CreatedByUserId,
        t.ModifiedByUserId
    FROM ServerTiers t
    WHERE t.TierName = @TierName AND t.IsActive = 1;
END
GO

-- =============================================
-- SP: Get Tier Specs By Tier ID
-- =============================================
CREATE PROCEDURE sp_GetTierSpecsByTierId
    @TierId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        s.SpecId,
        s.TierId,
        s.ServerType,
        s.CpuCores,
        s.RamGB,
        s.StorageGB,
        s.BackupEnabled,
        s.BackupFrequency,
        s.BackupRetentionDays,
        s.BandwidthMbps,
        s.PublicIpIncluded,
        s.MaxEntities,
        s.MaxTemplates,
        s.MaxUsers,
        s.MonthlyPrice,
        s.CreatedDate,
        s.ModifiedDate
    FROM ServerTierSpecs s
    WHERE s.TierId = @TierId
    ORDER BY 
        CASE s.ServerType
            WHEN 'Application' THEN 1
            WHEN 'Database' THEN 2
            ELSE 3
        END;
END
GO

-- =============================================
-- SP: Get All Tier Configurations (Tiers with Specs)
-- =============================================
CREATE PROCEDURE sp_GetAllTierConfigurations
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Return tiers
    SELECT 
        t.TierId,
        t.TierName,
        t.DisplayName,
        t.Description,
        t.IsActive,
        t.CreatedDate,
        t.ModifiedDate
    FROM ServerTiers t
    WHERE t.IsActive = 1
    ORDER BY 
        CASE t.TierName
            WHEN 'small' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'large' THEN 3
            ELSE 4
        END;
    
    -- Return all specs
    SELECT 
        s.SpecId,
        s.TierId,
        s.ServerType,
        s.CpuCores,
        s.RamGB,
        s.StorageGB,
        s.BackupEnabled,
        s.BackupFrequency,
        s.BackupRetentionDays,
        s.BandwidthMbps,
        s.PublicIpIncluded,
        s.MaxEntities,
        s.MaxTemplates,
        s.MaxUsers,
        s.MonthlyPrice,
        s.CreatedDate,
        s.ModifiedDate
    FROM ServerTierSpecs s
    INNER JOIN ServerTiers t ON s.TierId = t.TierId
    WHERE t.IsActive = 1
    ORDER BY 
        CASE t.TierName
            WHEN 'small' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'large' THEN 3
            ELSE 4
        END,
        CASE s.ServerType
            WHEN 'Application' THEN 1
            WHEN 'Database' THEN 2
            ELSE 3
        END;
END
GO

-- =============================================
-- SP: Update Tier Spec
-- =============================================
CREATE PROCEDURE sp_UpdateTierSpec
    @SpecId INT,
    @CpuCores INT,
    @RamGB INT,
    @StorageGB INT,
    @BackupEnabled BIT,
    @BackupFrequency NVARCHAR(50),
    @BackupRetentionDays INT,
    @BandwidthMbps INT,
    @PublicIpIncluded BIT,
    @MaxEntities INT,
    @MaxTemplates INT,
    @MaxUsers INT,
    @MonthlyPrice DECIMAL(10, 2)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE ServerTierSpecs
    SET 
        CpuCores = @CpuCores,
        RamGB = @RamGB,
        StorageGB = @StorageGB,
        BackupEnabled = @BackupEnabled,
        BackupFrequency = @BackupFrequency,
        BackupRetentionDays = @BackupRetentionDays,
        BandwidthMbps = @BandwidthMbps,
        PublicIpIncluded = @PublicIpIncluded,
        MaxEntities = @MaxEntities,
        MaxTemplates = @MaxTemplates,
        MaxUsers = @MaxUsers,
        MonthlyPrice = @MonthlyPrice,
        ModifiedDate = GETUTCDATE()
    WHERE SpecId = @SpecId;
    
    -- Return updated spec
    SELECT 
        s.SpecId,
        s.TierId,
        s.ServerType,
        s.CpuCores,
        s.RamGB,
        s.StorageGB,
        s.BackupEnabled,
        s.BackupFrequency,
        s.BackupRetentionDays,
        s.BandwidthMbps,
        s.PublicIpIncluded,
        s.MaxEntities,
        s.MaxTemplates,
        s.MaxUsers,
        s.MonthlyPrice,
        s.CreatedDate,
        s.ModifiedDate
    FROM ServerTierSpecs s
    WHERE s.SpecId = @SpecId;
END
GO

-- =============================================
-- SP: Create Server Tier
-- =============================================
CREATE PROCEDURE sp_CreateServerTier
    @TierName NVARCHAR(50),
    @DisplayName NVARCHAR(100),
    @Description NVARCHAR(500),
    @CreatedByUserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @TierId INT;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Insert Tier
        INSERT INTO ServerTiers (TierName, DisplayName, Description, CreatedByUserId, ModifiedByUserId)
        VALUES (@TierName, @DisplayName, @Description, @CreatedByUserId, @CreatedByUserId);
        
        SET @TierId = SCOPE_IDENTITY();
        
        COMMIT TRANSACTION;
        
        -- Return created tier
        EXEC sp_GetServerTierById @TierId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- =============================================
-- SP: Update Server Tier
-- =============================================
CREATE PROCEDURE sp_UpdateServerTier
    @TierId INT,
    @DisplayName NVARCHAR(100),
    @Description NVARCHAR(500),
    @ModifiedByUserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE ServerTiers
    SET 
        DisplayName = @DisplayName,
        Description = @Description,
        ModifiedByUserId = @ModifiedByUserId,
        ModifiedDate = GETUTCDATE()
    WHERE TierId = @TierId;
    
    -- Return updated tier
    EXEC sp_GetServerTierById @TierId;
END
GO

-- =============================================
-- SP: Create Tier Spec
-- =============================================
CREATE PROCEDURE sp_CreateTierSpec
    @TierId INT,
    @ServerType NVARCHAR(50),
    @CpuCores INT,
    @RamGB INT,
    @StorageGB INT,
    @BackupEnabled BIT,
    @BackupFrequency NVARCHAR(50),
    @BackupRetentionDays INT,
    @BandwidthMbps INT,
    @PublicIpIncluded BIT,
    @MaxEntities INT,
    @MaxTemplates INT,
    @MaxUsers INT,
    @MonthlyPrice DECIMAL(10, 2)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @SpecId INT;
    
    INSERT INTO ServerTierSpecs (
        TierId, ServerType, CpuCores, RamGB, StorageGB,
        BackupEnabled, BackupFrequency, BackupRetentionDays,
        BandwidthMbps, PublicIpIncluded,
        MaxEntities, MaxTemplates, MaxUsers, MonthlyPrice
    )
    VALUES (
        @TierId, @ServerType, @CpuCores, @RamGB, @StorageGB,
        @BackupEnabled, @BackupFrequency, @BackupRetentionDays,
        @BandwidthMbps, @PublicIpIncluded,
        @MaxEntities, @MaxTemplates, @MaxUsers, @MonthlyPrice
    );
    
    SET @SpecId = SCOPE_IDENTITY();
    
    -- Return created spec
    SELECT 
        s.SpecId,
        s.TierId,
        s.ServerType,
        s.CpuCores,
        s.RamGB,
        s.StorageGB,
        s.BackupEnabled,
        s.BackupFrequency,
        s.BackupRetentionDays,
        s.BandwidthMbps,
        s.PublicIpIncluded,
        s.MaxEntities,
        s.MaxTemplates,
        s.MaxUsers,
        s.MonthlyPrice,
        s.CreatedDate,
        s.ModifiedDate
    FROM ServerTierSpecs s
    WHERE s.SpecId = @SpecId;
END
GO

-- =============================================
-- SP: Get Recommended Tier
-- =============================================
CREATE PROCEDURE sp_GetRecommendedTier
    @RequiredEntities INT,
    @RequiredTemplates INT,
    @RequiredUsers INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Find the smallest tier that can accommodate the requirements
    SELECT TOP 1
        t.TierId,
        t.TierName,
        t.DisplayName,
        t.Description,
        s.MaxEntities,
        s.MaxTemplates,
        s.MaxUsers
    FROM ServerTiers t
    INNER JOIN ServerTierSpecs s ON t.TierId = s.TierId
    WHERE 
        t.IsActive = 1
        AND s.ServerType = 'Application'
        AND s.MaxEntities >= @RequiredEntities
        AND s.MaxTemplates >= @RequiredTemplates
        AND s.MaxUsers >= @RequiredUsers
    ORDER BY 
        CASE t.TierName
            WHEN 'small' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'large' THEN 3
            ELSE 4
        END;
END
GO

-- =============================================
-- SP: Delete Server Tier (Soft Delete)
-- =============================================
CREATE PROCEDURE sp_DeleteServerTier
    @TierId INT,
    @ModifiedByUserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE ServerTiers
    SET 
        IsActive = 0,
        ModifiedByUserId = @ModifiedByUserId,
        ModifiedDate = GETUTCDATE()
    WHERE TierId = @TierId;
END
GO
