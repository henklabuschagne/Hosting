-- =============================================
-- Server Tier Management Stored Procedures
-- =============================================

USE HostingPlatformDB;
GO

-- =============================================
-- SP: Get All Server Tiers
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetAllServerTiers')
    DROP PROCEDURE sp_GetAllServerTiers;
GO

CREATE PROCEDURE sp_GetAllServerTiers
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
    WHERE IsActive = 1
    ORDER BY PricePerMonth;
END
GO

-- =============================================
-- SP: Get Server Tier By ID
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetServerTierById')
    DROP PROCEDURE sp_GetServerTierById;
GO

CREATE PROCEDURE sp_GetServerTierById
    @TierId INT
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
    WHERE TierId = @TierId;
END
GO

-- =============================================
-- SP: Create Server Tier
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_CreateServerTier')
    DROP PROCEDURE sp_CreateServerTier;
GO

CREATE PROCEDURE sp_CreateServerTier
    @TierName NVARCHAR(50),
    @DisplayName NVARCHAR(100),
    @MaxEntities INT,
    @MaxTemplates INT,
    @MaxUsers INT,
    @PricePerMonth DECIMAL(10,2),
    @Description NVARCHAR(500) = NULL,
    @CreatedBy INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Check if tier name already exists
        IF EXISTS (SELECT 1 FROM ServerTiers WHERE TierName = @TierName)
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR('Tier name already exists', 16, 1);
            RETURN 1;
        END
        
        -- Insert tier
        INSERT INTO ServerTiers (
            TierName, DisplayName, MaxEntities, MaxTemplates, MaxUsers,
            PricePerMonth, Description
        )
        VALUES (
            @TierName, @DisplayName, @MaxEntities, @MaxTemplates, @MaxUsers,
            @PricePerMonth, @Description
        );
        
        DECLARE @NewTierId INT = SCOPE_IDENTITY();
        
        -- Log audit
        INSERT INTO AuditLog (UserId, Action, EntityType, EntityId, NewValues)
        VALUES (@CreatedBy, 'CREATE', 'ServerTier', @NewTierId,
                CONCAT('Tier: ', @TierName, ', Price: ', @PricePerMonth));
        
        -- Return new tier
        EXEC sp_GetServerTierById @NewTierId;
        
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
-- SP: Update Server Tier
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateServerTier')
    DROP PROCEDURE sp_UpdateServerTier;
GO

CREATE PROCEDURE sp_UpdateServerTier
    @TierId INT,
    @DisplayName NVARCHAR(100) = NULL,
    @MaxEntities INT = NULL,
    @MaxTemplates INT = NULL,
    @MaxUsers INT = NULL,
    @PricePerMonth DECIMAL(10,2) = NULL,
    @Description NVARCHAR(500) = NULL,
    @UpdatedBy INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Update tier
        UPDATE ServerTiers
        SET 
            DisplayName = ISNULL(@DisplayName, DisplayName),
            MaxEntities = ISNULL(@MaxEntities, MaxEntities),
            MaxTemplates = ISNULL(@MaxTemplates, MaxTemplates),
            MaxUsers = ISNULL(@MaxUsers, MaxUsers),
            PricePerMonth = ISNULL(@PricePerMonth, PricePerMonth),
            Description = ISNULL(@Description, Description),
            ModifiedDate = GETUTCDATE()
        WHERE TierId = @TierId;
        
        -- Log audit
        INSERT INTO AuditLog (UserId, Action, EntityType, EntityId, NewValues)
        VALUES (@UpdatedBy, 'UPDATE', 'ServerTier', @TierId,
                CONCAT('Updated tier ', @TierId));
        
        -- Return updated tier
        EXEC sp_GetServerTierById @TierId;
        
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
-- SP: Get Tier Recommendation
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetTierRecommendation')
    DROP PROCEDURE sp_GetTierRecommendation;
GO

CREATE PROCEDURE sp_GetTierRecommendation
    @RequestedEntities INT,
    @RequestedTemplates INT,
    @RequestedUsers INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Find the smallest tier that can accommodate the request
    SELECT TOP 1
        TierId,
        TierName,
        DisplayName,
        MaxEntities,
        MaxTemplates,
        MaxUsers,
        PricePerMonth,
        Description,
        -- Calculate headroom percentage
        CAST(((MaxEntities - @RequestedEntities) * 100.0 / MaxEntities) AS DECIMAL(5,2)) AS EntitiesHeadroom,
        CAST(((MaxTemplates - @RequestedTemplates) * 100.0 / MaxTemplates) AS DECIMAL(5,2)) AS TemplatesHeadroom,
        CAST(((MaxUsers - @RequestedUsers) * 100.0 / MaxUsers) AS DECIMAL(5,2)) AS UsersHeadroom
    FROM ServerTiers
    WHERE IsActive = 1
        AND MaxEntities >= @RequestedEntities
        AND MaxTemplates >= @RequestedTemplates
        AND MaxUsers >= @RequestedUsers
    ORDER BY PricePerMonth, MaxEntities;
    
    -- If no tier found, recommend the largest tier
    IF @@ROWCOUNT = 0
    BEGIN
        SELECT TOP 1
            TierId,
            TierName,
            DisplayName,
            MaxEntities,
            MaxTemplates,
            MaxUsers,
            PricePerMonth,
            Description,
            CAST(-100 AS DECIMAL(5,2)) AS EntitiesHeadroom,
            CAST(-100 AS DECIMAL(5,2)) AS TemplatesHeadroom,
            CAST(-100 AS DECIMAL(5,2)) AS UsersHeadroom
        FROM ServerTiers
        WHERE IsActive = 1
        ORDER BY PricePerMonth DESC, MaxEntities DESC;
    END
END
GO

PRINT 'Server Tier stored procedures created successfully!';
GO
