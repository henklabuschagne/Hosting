-- =============================================
-- Tier Recommendation Requests Stored Procedures
-- =============================================

USE HostingPlatformDB;
GO

-- =============================================
-- SP: Get All Tier Requests
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetAllTierRequests')
    DROP PROCEDURE sp_GetAllTierRequests;
GO

CREATE PROCEDURE sp_GetAllTierRequests
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        r.RequestId,
        r.CustomerName,
        r.CustomerEmail,
        r.RequestedEntities,
        r.RequestedTemplates,
        r.RequestedUsers,
        r.RecommendedTierId,
        r.RecommendedTierName,
        r.EstimatedMonthlyCost,
        r.Status,
        r.RequestDate,
        r.ReviewedDate,
        r.ReviewedBy,
        u.Username AS ReviewedByUsername,
        r.Notes
    FROM TierRecommendationRequests r
    LEFT JOIN Users u ON r.ReviewedBy = u.UserId
    ORDER BY 
        CASE r.Status
            WHEN 'pending' THEN 1
            WHEN 'reviewed' THEN 2
            WHEN 'converted' THEN 3
            WHEN 'declined' THEN 4
        END,
        r.RequestDate DESC;
END
GO

-- =============================================
-- SP: Get Tier Request By ID
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetTierRequestById')
    DROP PROCEDURE sp_GetTierRequestById;
GO

CREATE PROCEDURE sp_GetTierRequestById
    @RequestId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        r.RequestId,
        r.CustomerName,
        r.CustomerEmail,
        r.RequestedEntities,
        r.RequestedTemplates,
        r.RequestedUsers,
        r.RecommendedTierId,
        r.RecommendedTierName,
        r.EstimatedMonthlyCost,
        r.Status,
        r.RequestDate,
        r.ReviewedDate,
        r.ReviewedBy,
        u.Username AS ReviewedByUsername,
        r.Notes
    FROM TierRecommendationRequests r
    LEFT JOIN Users u ON r.ReviewedBy = u.UserId
    WHERE r.RequestId = @RequestId;
END
GO

-- =============================================
-- SP: Create Tier Request
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_CreateTierRequest')
    DROP PROCEDURE sp_CreateTierRequest;
GO

CREATE PROCEDURE sp_CreateTierRequest
    @CustomerName NVARCHAR(200),
    @CustomerEmail NVARCHAR(255) = NULL,
    @RequestedEntities INT,
    @RequestedTemplates INT,
    @RequestedUsers INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Get tier recommendation
        DECLARE @RecommendedTierId INT;
        DECLARE @RecommendedTierName NVARCHAR(100);
        DECLARE @EstimatedCost DECIMAL(10,2);
        
        SELECT TOP 1
            @RecommendedTierId = TierId,
            @RecommendedTierName = DisplayName,
            @EstimatedCost = PricePerMonth
        FROM ServerTiers
        WHERE IsActive = 1
            AND MaxEntities >= @RequestedEntities
            AND MaxTemplates >= @RequestedTemplates
            AND MaxUsers >= @RequestedUsers
        ORDER BY PricePerMonth, MaxEntities;
        
        -- If no tier found, get largest tier
        IF @RecommendedTierId IS NULL
        BEGIN
            SELECT TOP 1
                @RecommendedTierId = TierId,
                @RecommendedTierName = DisplayName + ' (Requires Custom Solution)',
                @EstimatedCost = PricePerMonth
            FROM ServerTiers
            WHERE IsActive = 1
            ORDER BY PricePerMonth DESC;
        END
        
        -- Insert request
        INSERT INTO TierRecommendationRequests (
            CustomerName, CustomerEmail,
            RequestedEntities, RequestedTemplates, RequestedUsers,
            RecommendedTierId, RecommendedTierName, EstimatedMonthlyCost,
            Status
        )
        VALUES (
            @CustomerName, @CustomerEmail,
            @RequestedEntities, @RequestedTemplates, @RequestedUsers,
            @RecommendedTierId, @RecommendedTierName, @EstimatedCost,
            'pending'
        );
        
        DECLARE @NewRequestId INT = SCOPE_IDENTITY();
        
        -- Return new request
        EXEC sp_GetTierRequestById @NewRequestId;
        
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
-- SP: Update Tier Request Status
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateTierRequestStatus')
    DROP PROCEDURE sp_UpdateTierRequestStatus;
GO

CREATE PROCEDURE sp_UpdateTierRequestStatus
    @RequestId INT,
    @Status NVARCHAR(50),
    @Notes NVARCHAR(1000) = NULL,
    @ReviewedBy INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Update request
        UPDATE TierRecommendationRequests
        SET 
            Status = @Status,
            Notes = ISNULL(@Notes, Notes),
            ReviewedDate = CASE WHEN @Status IN ('reviewed', 'converted', 'declined') 
                               THEN GETUTCDATE() 
                               ELSE ReviewedDate 
                          END,
            ReviewedBy = CASE WHEN @Status IN ('reviewed', 'converted', 'declined')
                             THEN @ReviewedBy
                             ELSE ReviewedBy
                        END
        WHERE RequestId = @RequestId;
        
        -- Log audit
        INSERT INTO AuditLog (UserId, Action, EntityType, EntityId, NewValues)
        VALUES (@ReviewedBy, 'UPDATE', 'TierRequest', @RequestId,
                CONCAT('Status changed to: ', @Status));
        
        -- Return updated request
        EXEC sp_GetTierRequestById @RequestId;
        
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
-- SP: Delete Tier Request
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_DeleteTierRequest')
    DROP PROCEDURE sp_DeleteTierRequest;
GO

CREATE PROCEDURE sp_DeleteTierRequest
    @RequestId INT,
    @DeletedBy INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Log audit
        INSERT INTO AuditLog (UserId, Action, EntityType, EntityId)
        VALUES (@DeletedBy, 'DELETE', 'TierRequest', @RequestId);
        
        -- Delete request
        DELETE FROM TierRecommendationRequests WHERE RequestId = @RequestId;
        
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

PRINT 'Tier Request stored procedures created successfully!';
GO
