-- =============================================
-- Client Management Stored Procedures
-- =============================================

USE HostingPlatformDB;
GO

-- =============================================
-- SP: Get All Clients
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetAllClients')
    DROP PROCEDURE sp_GetAllClients;
GO

CREATE PROCEDURE sp_GetAllClients
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        c.ClientId,
        c.ClientName,
        c.TierId,
        t.TierName,
        t.DisplayName AS TierDisplayName,
        c.HostingType,
        c.CurrentEntities,
        c.CurrentTemplates,
        c.CurrentUsers,
        c.DiscussedMonthlyFee,
        c.ActualMonthlyFee,
        c.Status,
        c.ContactEmail,
        c.ContactPhone,
        c.Notes,
        c.CreatedDate,
        c.ModifiedDate,
        t.MaxEntities,
        t.MaxTemplates,
        t.MaxUsers
    FROM Clients c
    INNER JOIN ServerTiers t ON c.TierId = t.TierId
    ORDER BY c.ClientName;
END
GO

-- =============================================
-- SP: Get Client By ID
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetClientById')
    DROP PROCEDURE sp_GetClientById;
GO

CREATE PROCEDURE sp_GetClientById
    @ClientId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        c.ClientId,
        c.ClientName,
        c.TierId,
        t.TierName,
        t.DisplayName AS TierDisplayName,
        c.HostingType,
        c.CurrentEntities,
        c.CurrentTemplates,
        c.CurrentUsers,
        c.DiscussedMonthlyFee,
        c.ActualMonthlyFee,
        c.Status,
        c.ContactEmail,
        c.ContactPhone,
        c.Notes,
        c.CreatedDate,
        c.ModifiedDate,
        t.MaxEntities,
        t.MaxTemplates,
        t.MaxUsers
    FROM Clients c
    INNER JOIN ServerTiers t ON c.TierId = t.TierId
    WHERE c.ClientId = @ClientId;
END
GO

-- =============================================
-- SP: Create Client
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_CreateClient')
    DROP PROCEDURE sp_CreateClient;
GO

CREATE PROCEDURE sp_CreateClient
    @ClientName NVARCHAR(200),
    @TierId INT,
    @HostingType NVARCHAR(50),
    @CurrentEntities INT = 0,
    @CurrentTemplates INT = 0,
    @CurrentUsers INT = 0,
    @DiscussedMonthlyFee DECIMAL(10,2),
    @ActualMonthlyFee DECIMAL(10,2),
    @Status NVARCHAR(50) = 'active',
    @ContactEmail NVARCHAR(255) = NULL,
    @ContactPhone NVARCHAR(50) = NULL,
    @Notes NVARCHAR(1000) = NULL,
    @CreatedBy INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Insert client
        INSERT INTO Clients (
            ClientName, TierId, HostingType, 
            CurrentEntities, CurrentTemplates, CurrentUsers,
            DiscussedMonthlyFee, ActualMonthlyFee, Status,
            ContactEmail, ContactPhone, Notes
        )
        VALUES (
            @ClientName, @TierId, @HostingType,
            @CurrentEntities, @CurrentTemplates, @CurrentUsers,
            @DiscussedMonthlyFee, @ActualMonthlyFee, @Status,
            @ContactEmail, @ContactPhone, @Notes
        );
        
        DECLARE @NewClientId INT = SCOPE_IDENTITY();
        
        -- Create initial history record
        INSERT INTO ClientHostingHistory (
            ClientId, TierId, HostingType, 
            Entities, Templates, Users, MonthlyFee,
            StartDate, ChangedBy
        )
        VALUES (
            @NewClientId, @TierId, @HostingType,
            @CurrentEntities, @CurrentTemplates, @CurrentUsers,
            @ActualMonthlyFee, GETUTCDATE(), @CreatedBy
        );
        
        -- Log audit
        INSERT INTO AuditLog (UserId, Action, EntityType, EntityId, NewValues)
        VALUES (@CreatedBy, 'CREATE', 'Client', @NewClientId,
                CONCAT('Client: ', @ClientName, ', Tier: ', @TierId));
        
        -- Return new client
        EXEC sp_GetClientById @NewClientId;
        
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
-- SP: Update Client
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateClient')
    DROP PROCEDURE sp_UpdateClient;
GO

CREATE PROCEDURE sp_UpdateClient
    @ClientId INT,
    @ClientName NVARCHAR(200) = NULL,
    @TierId INT = NULL,
    @HostingType NVARCHAR(50) = NULL,
    @CurrentEntities INT = NULL,
    @CurrentTemplates INT = NULL,
    @CurrentUsers INT = NULL,
    @DiscussedMonthlyFee DECIMAL(10,2) = NULL,
    @ActualMonthlyFee DECIMAL(10,2) = NULL,
    @Status NVARCHAR(50) = NULL,
    @ContactEmail NVARCHAR(255) = NULL,
    @ContactPhone NVARCHAR(50) = NULL,
    @Notes NVARCHAR(1000) = NULL,
    @UpdatedBy INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Get old values for audit
        DECLARE @OldTierId INT;
        SELECT @OldTierId = TierId FROM Clients WHERE ClientId = @ClientId;
        
        -- Update client
        UPDATE Clients
        SET 
            ClientName = ISNULL(@ClientName, ClientName),
            TierId = ISNULL(@TierId, TierId),
            HostingType = ISNULL(@HostingType, HostingType),
            CurrentEntities = ISNULL(@CurrentEntities, CurrentEntities),
            CurrentTemplates = ISNULL(@CurrentTemplates, CurrentTemplates),
            CurrentUsers = ISNULL(@CurrentUsers, CurrentUsers),
            DiscussedMonthlyFee = ISNULL(@DiscussedMonthlyFee, DiscussedMonthlyFee),
            ActualMonthlyFee = ISNULL(@ActualMonthlyFee, ActualMonthlyFee),
            Status = ISNULL(@Status, Status),
            ContactEmail = ISNULL(@ContactEmail, ContactEmail),
            ContactPhone = ISNULL(@ContactPhone, ContactPhone),
            Notes = ISNULL(@Notes, Notes),
            ModifiedDate = GETUTCDATE()
        WHERE ClientId = @ClientId;
        
        -- If tier changed, update history
        IF @TierId IS NOT NULL AND @TierId <> @OldTierId
        BEGIN
            -- Close old history record
            UPDATE ClientHostingHistory
            SET EndDate = GETUTCDATE()
            WHERE ClientId = @ClientId AND EndDate IS NULL;
            
            -- Create new history record
            INSERT INTO ClientHostingHistory (
                ClientId, TierId, HostingType,
                Entities, Templates, Users, MonthlyFee,
                StartDate, ChangedBy, ChangeReason
            )
            SELECT 
                ClientId, TierId, HostingType,
                CurrentEntities, CurrentTemplates, CurrentUsers,
                ActualMonthlyFee, GETUTCDATE(), @UpdatedBy,
                'Tier changed'
            FROM Clients
            WHERE ClientId = @ClientId;
        END
        
        -- Log audit
        INSERT INTO AuditLog (UserId, Action, EntityType, EntityId, NewValues)
        VALUES (@UpdatedBy, 'UPDATE', 'Client', @ClientId,
                CONCAT('Updated client ', @ClientId));
        
        -- Return updated client
        EXEC sp_GetClientById @ClientId;
        
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
-- SP: Delete Client
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_DeleteClient')
    DROP PROCEDURE sp_DeleteClient;
GO

CREATE PROCEDURE sp_DeleteClient
    @ClientId INT,
    @DeletedBy INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Delete client-server assignments
        DELETE FROM ClientServerAssignments WHERE ClientId = @ClientId;
        
        -- Close history records
        UPDATE ClientHostingHistory
        SET EndDate = GETUTCDATE()
        WHERE ClientId = @ClientId AND EndDate IS NULL;
        
        -- Log audit
        INSERT INTO AuditLog (UserId, Action, EntityType, EntityId)
        VALUES (@DeletedBy, 'DELETE', 'Client', @ClientId);
        
        -- Delete client
        DELETE FROM Clients WHERE ClientId = @ClientId;
        
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
-- SP: Get Client Servers
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetClientServers')
    DROP PROCEDURE sp_GetClientServers;
GO

CREATE PROCEDURE sp_GetClientServers
    @ClientId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        s.ServerId,
        s.ServerName,
        s.ServerType,
        s.TierId,
        t.TierName,
        t.DisplayName AS TierDisplayName,
        s.MaxEntities,
        s.MaxTemplates,
        s.MaxUsers,
        s.IPAddress,
        s.Location,
        s.Status,
        csa.AssignedDate,
        csa.IsActive
    FROM ClientServerAssignments csa
    INNER JOIN Servers s ON csa.ServerId = s.ServerId
    INNER JOIN ServerTiers t ON s.TierId = t.TierId
    WHERE csa.ClientId = @ClientId AND csa.IsActive = 1
    ORDER BY s.ServerType, s.ServerName;
END
GO

-- =============================================
-- SP: Get Client Hosting History
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetClientHostingHistory')
    DROP PROCEDURE sp_GetClientHostingHistory;
GO

CREATE PROCEDURE sp_GetClientHostingHistory
    @ClientId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        h.HistoryId,
        h.ClientId,
        h.TierId,
        t.TierName,
        t.DisplayName AS TierDisplayName,
        h.ServerId,
        s.ServerName,
        h.HostingType,
        h.Entities,
        h.Templates,
        h.Users,
        h.MonthlyFee,
        h.StartDate,
        h.EndDate,
        h.ChangeReason,
        h.ChangedBy,
        u.Username AS ChangedByUsername
    FROM ClientHostingHistory h
    INNER JOIN ServerTiers t ON h.TierId = t.TierId
    LEFT JOIN Servers s ON h.ServerId = s.ServerId
    LEFT JOIN Users u ON h.ChangedBy = u.UserId
    WHERE h.ClientId = @ClientId
    ORDER BY h.StartDate DESC;
END
GO

PRINT 'Client stored procedures created successfully!';
GO
