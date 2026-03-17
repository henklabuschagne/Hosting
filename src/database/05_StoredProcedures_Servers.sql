-- =============================================
-- Server Management Stored Procedures
-- =============================================

USE HostingPlatformDB;
GO

-- =============================================
-- SP: Get All Servers
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetAllServers')
    DROP PROCEDURE sp_GetAllServers;
GO

CREATE PROCEDURE sp_GetAllServers
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
        s.Notes,
        s.CreatedDate,
        s.ModifiedDate
    FROM Servers s
    INNER JOIN ServerTiers t ON s.TierId = t.TierId
    ORDER BY s.ServerType, s.ServerName;
END
GO

-- =============================================
-- SP: Get Server By ID
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetServerById')
    DROP PROCEDURE sp_GetServerById;
GO

CREATE PROCEDURE sp_GetServerById
    @ServerId INT
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
        s.Notes,
        s.CreatedDate,
        s.ModifiedDate
    FROM Servers s
    INNER JOIN ServerTiers t ON s.TierId = t.TierId
    WHERE s.ServerId = @ServerId;
END
GO

-- =============================================
-- SP: Create Server
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_CreateServer')
    DROP PROCEDURE sp_CreateServer;
GO

CREATE PROCEDURE sp_CreateServer
    @ServerName NVARCHAR(200),
    @ServerType NVARCHAR(50),
    @TierId INT,
    @MaxEntities INT,
    @MaxTemplates INT,
    @MaxUsers INT,
    @IPAddress NVARCHAR(50) = NULL,
    @Location NVARCHAR(200) = NULL,
    @Status NVARCHAR(50) = 'Active',
    @Notes NVARCHAR(1000) = NULL,
    @CreatedBy INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Insert server
        INSERT INTO Servers (
            ServerName, ServerType, TierId,
            MaxEntities, MaxTemplates, MaxUsers,
            IPAddress, Location, Status, Notes
        )
        VALUES (
            @ServerName, @ServerType, @TierId,
            @MaxEntities, @MaxTemplates, @MaxUsers,
            @IPAddress, @Location, @Status, @Notes
        );
        
        DECLARE @NewServerId INT = SCOPE_IDENTITY();
        
        -- Log audit
        INSERT INTO AuditLog (UserId, Action, EntityType, EntityId, NewValues)
        VALUES (@CreatedBy, 'CREATE', 'Server', @NewServerId,
                CONCAT('Server: ', @ServerName, ', Type: ', @ServerType));
        
        -- Return new server
        EXEC sp_GetServerById @NewServerId;
        
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
-- SP: Update Server
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateServer')
    DROP PROCEDURE sp_UpdateServer;
GO

CREATE PROCEDURE sp_UpdateServer
    @ServerId INT,
    @ServerName NVARCHAR(200) = NULL,
    @ServerType NVARCHAR(50) = NULL,
    @TierId INT = NULL,
    @MaxEntities INT = NULL,
    @MaxTemplates INT = NULL,
    @MaxUsers INT = NULL,
    @IPAddress NVARCHAR(50) = NULL,
    @Location NVARCHAR(200) = NULL,
    @Status NVARCHAR(50) = NULL,
    @Notes NVARCHAR(1000) = NULL,
    @UpdatedBy INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Update server
        UPDATE Servers
        SET 
            ServerName = ISNULL(@ServerName, ServerName),
            ServerType = ISNULL(@ServerType, ServerType),
            TierId = ISNULL(@TierId, TierId),
            MaxEntities = ISNULL(@MaxEntities, MaxEntities),
            MaxTemplates = ISNULL(@MaxTemplates, MaxTemplates),
            MaxUsers = ISNULL(@MaxUsers, MaxUsers),
            IPAddress = ISNULL(@IPAddress, IPAddress),
            Location = ISNULL(@Location, Location),
            Status = ISNULL(@Status, Status),
            Notes = ISNULL(@Notes, Notes),
            ModifiedDate = GETUTCDATE()
        WHERE ServerId = @ServerId;
        
        -- Log audit
        INSERT INTO AuditLog (UserId, Action, EntityType, EntityId, NewValues)
        VALUES (@UpdatedBy, 'UPDATE', 'Server', @ServerId,
                CONCAT('Updated server ', @ServerId));
        
        -- Return updated server
        EXEC sp_GetServerById @ServerId;
        
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
-- SP: Delete Server
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_DeleteServer')
    DROP PROCEDURE sp_DeleteServer;
GO

CREATE PROCEDURE sp_DeleteServer
    @ServerId INT,
    @DeletedBy INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Check if server has active clients
        IF EXISTS (
            SELECT 1 FROM ClientServerAssignments 
            WHERE ServerId = @ServerId AND IsActive = 1
        )
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR('Cannot delete server with active client assignments', 16, 1);
            RETURN 1;
        END
        
        -- Delete inactive assignments
        DELETE FROM ClientServerAssignments WHERE ServerId = @ServerId;
        
        -- Log audit
        INSERT INTO AuditLog (UserId, Action, EntityType, EntityId)
        VALUES (@DeletedBy, 'DELETE', 'Server', @ServerId);
        
        -- Delete server
        DELETE FROM Servers WHERE ServerId = @ServerId;
        
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
-- SP: Get Server Clients
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetServerClients')
    DROP PROCEDURE sp_GetServerClients;
GO

CREATE PROCEDURE sp_GetServerClients
    @ServerId INT
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
        c.Status,
        csa.AssignedDate,
        csa.IsActive
    FROM ClientServerAssignments csa
    INNER JOIN Clients c ON csa.ClientId = c.ClientId
    INNER JOIN ServerTiers t ON c.TierId = t.TierId
    WHERE csa.ServerId = @ServerId AND csa.IsActive = 1
    ORDER BY c.ClientName;
END
GO

-- =============================================
-- SP: Get Server Capacity
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetServerCapacity')
    DROP PROCEDURE sp_GetServerCapacity;
GO

CREATE PROCEDURE sp_GetServerCapacity
    @ServerId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @MaxEntities INT, @MaxTemplates INT, @MaxUsers INT;
    DECLARE @UsedEntities INT = 0, @UsedTemplates INT = 0, @UsedUsers INT = 0;
    
    -- Get server limits
    SELECT 
        @MaxEntities = MaxEntities,
        @MaxTemplates = MaxTemplates,
        @MaxUsers = MaxUsers
    FROM Servers
    WHERE ServerId = @ServerId;
    
    -- Calculate used capacity from active clients
    SELECT 
        @UsedEntities = ISNULL(SUM(c.CurrentEntities), 0),
        @UsedTemplates = ISNULL(SUM(c.CurrentTemplates), 0),
        @UsedUsers = ISNULL(SUM(c.CurrentUsers), 0)
    FROM ClientServerAssignments csa
    INNER JOIN Clients c ON csa.ClientId = c.ClientId
    WHERE csa.ServerId = @ServerId 
        AND csa.IsActive = 1
        AND c.Status = 'active';
    
    -- Return capacity information
    SELECT 
        @ServerId AS ServerId,
        @MaxEntities AS MaxEntities,
        @UsedEntities AS UsedEntities,
        @MaxEntities - @UsedEntities AS AvailableEntities,
        CAST((@UsedEntities * 100.0 / NULLIF(@MaxEntities, 0)) AS DECIMAL(5,2)) AS EntitiesUsagePercent,
        
        @MaxTemplates AS MaxTemplates,
        @UsedTemplates AS UsedTemplates,
        @MaxTemplates - @UsedTemplates AS AvailableTemplates,
        CAST((@UsedTemplates * 100.0 / NULLIF(@MaxTemplates, 0)) AS DECIMAL(5,2)) AS TemplatesUsagePercent,
        
        @MaxUsers AS MaxUsers,
        @UsedUsers AS UsedUsers,
        @MaxUsers - @UsedUsers AS AvailableUsers,
        CAST((@UsedUsers * 100.0 / NULLIF(@MaxUsers, 0)) AS DECIMAL(5,2)) AS UsersUsagePercent,
        
        CAST((
            ((@UsedEntities * 100.0 / NULLIF(@MaxEntities, 0)) +
             (@UsedTemplates * 100.0 / NULLIF(@MaxTemplates, 0)) +
             (@UsedUsers * 100.0 / NULLIF(@MaxUsers, 0))) / 3
        ) AS DECIMAL(5,2)) AS AverageUsagePercent;
END
GO

-- =============================================
-- SP: Assign Client to Server
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_AssignClientToServer')
    DROP PROCEDURE sp_AssignClientToServer;
GO

CREATE PROCEDURE sp_AssignClientToServer
    @ClientId INT,
    @ServerId INT,
    @AssignedBy INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Check if assignment already exists
        IF EXISTS (
            SELECT 1 FROM ClientServerAssignments
            WHERE ClientId = @ClientId AND ServerId = @ServerId AND IsActive = 1
        )
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR('Client is already assigned to this server', 16, 1);
            RETURN 1;
        END
        
        -- Create assignment
        INSERT INTO ClientServerAssignments (ClientId, ServerId, IsActive)
        VALUES (@ClientId, @ServerId, 1);
        
        -- Update history
        UPDATE ClientHostingHistory
        SET ServerId = @ServerId
        WHERE ClientId = @ClientId AND EndDate IS NULL;
        
        -- Log audit
        INSERT INTO AuditLog (UserId, Action, EntityType, EntityId, NewValues)
        VALUES (@AssignedBy, 'ASSIGN', 'ClientServerAssignment', @ClientId,
                CONCAT('Client ', @ClientId, ' assigned to Server ', @ServerId));
        
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
-- SP: Unassign Client from Server
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UnassignClientFromServer')
    DROP PROCEDURE sp_UnassignClientFromServer;
GO

CREATE PROCEDURE sp_UnassignClientFromServer
    @ClientId INT,
    @ServerId INT,
    @UnassignedBy INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Deactivate assignment
        UPDATE ClientServerAssignments
        SET IsActive = 0
        WHERE ClientId = @ClientId AND ServerId = @ServerId;
        
        -- Log audit
        INSERT INTO AuditLog (UserId, Action, EntityType, EntityId, NewValues)
        VALUES (@UnassignedBy, 'UNASSIGN', 'ClientServerAssignment', @ClientId,
                CONCAT('Client ', @ClientId, ' unassigned from Server ', @ServerId));
        
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

PRINT 'Server stored procedures created successfully!';
GO
