-- =============================================
-- Phase 4: Stored Procedures for Client Management
-- =============================================

-- =============================================
-- SP: Get All Clients
-- =============================================
CREATE PROCEDURE sp_GetAllClients
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        c.ClientId,
        c.ClientName,
        c.CompanyName,
        c.ContactEmail,
        c.ContactPhone,
        c.CurrentApplicationServerId,
        c.CurrentDatabaseServerId,
        c.HostingType,
        c.TierId,
        t.TierName,
        t.DisplayName AS TierDisplayName,
        c.CurrentEntities,
        c.CurrentTemplates,
        c.CurrentUsers,
        c.DiscussedMonthlyFee,
        c.ActualMonthlyFee,
        c.StartDate,
        c.EndDate,
        c.Status,
        c.IsActive,
        c.CreatedDate,
        c.ModifiedDate,
        c.Notes,
        appServer.ServerName AS ApplicationServerName,
        dbServer.ServerName AS DatabaseServerName
    FROM Clients c
    INNER JOIN ServerTiers t ON c.TierId = t.TierId
    LEFT JOIN Servers appServer ON c.CurrentApplicationServerId = appServer.ServerId
    LEFT JOIN Servers dbServer ON c.CurrentDatabaseServerId = dbServer.ServerId
    WHERE c.IsActive = 1
    ORDER BY c.ClientName;
END
GO

-- =============================================
-- SP: Get Client By ID
-- =============================================
CREATE PROCEDURE sp_GetClientById
    @ClientId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        c.ClientId,
        c.ClientName,
        c.CompanyName,
        c.ContactEmail,
        c.ContactPhone,
        c.CurrentApplicationServerId,
        c.CurrentDatabaseServerId,
        c.HostingType,
        c.TierId,
        t.TierName,
        t.DisplayName AS TierDisplayName,
        c.CurrentEntities,
        c.CurrentTemplates,
        c.CurrentUsers,
        c.DiscussedMonthlyFee,
        c.ActualMonthlyFee,
        c.StartDate,
        c.EndDate,
        c.Status,
        c.IsActive,
        c.CreatedDate,
        c.ModifiedDate,
        c.Notes,
        appServer.ServerName AS ApplicationServerName,
        dbServer.ServerName AS DatabaseServerName
    FROM Clients c
    INNER JOIN ServerTiers t ON c.TierId = t.TierId
    LEFT JOIN Servers appServer ON c.CurrentApplicationServerId = appServer.ServerId
    LEFT JOIN Servers dbServer ON c.CurrentDatabaseServerId = dbServer.ServerId
    WHERE c.ClientId = @ClientId;
END
GO

-- =============================================
-- SP: Get Clients By Server
-- =============================================
CREATE PROCEDURE sp_GetClientsByServer
    @ServerId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        c.ClientId,
        c.ClientName,
        c.CompanyName,
        c.ContactEmail,
        c.ContactPhone,
        c.CurrentApplicationServerId,
        c.CurrentDatabaseServerId,
        c.HostingType,
        c.TierId,
        t.TierName,
        t.DisplayName AS TierDisplayName,
        c.CurrentEntities,
        c.CurrentTemplates,
        c.CurrentUsers,
        c.DiscussedMonthlyFee,
        c.ActualMonthlyFee,
        c.StartDate,
        c.EndDate,
        c.Status,
        c.IsActive,
        c.CreatedDate,
        c.ModifiedDate,
        c.Notes,
        appServer.ServerName AS ApplicationServerName,
        dbServer.ServerName AS DatabaseServerName
    FROM Clients c
    INNER JOIN ServerTiers t ON c.TierId = t.TierId
    LEFT JOIN Servers appServer ON c.CurrentApplicationServerId = appServer.ServerId
    LEFT JOIN Servers dbServer ON c.CurrentDatabaseServerId = dbServer.ServerId
    WHERE (c.CurrentApplicationServerId = @ServerId OR c.CurrentDatabaseServerId = @ServerId)
    AND c.IsActive = 1
    ORDER BY c.ClientName;
END
GO

-- =============================================
-- SP: Get Clients By Tier
-- =============================================
CREATE PROCEDURE sp_GetClientsByTier
    @TierId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        c.ClientId,
        c.ClientName,
        c.CompanyName,
        c.ContactEmail,
        c.ContactPhone,
        c.CurrentApplicationServerId,
        c.CurrentDatabaseServerId,
        c.HostingType,
        c.TierId,
        t.TierName,
        t.DisplayName AS TierDisplayName,
        c.CurrentEntities,
        c.CurrentTemplates,
        c.CurrentUsers,
        c.DiscussedMonthlyFee,
        c.ActualMonthlyFee,
        c.StartDate,
        c.EndDate,
        c.Status,
        c.IsActive,
        c.CreatedDate,
        c.ModifiedDate,
        c.Notes,
        appServer.ServerName AS ApplicationServerName,
        dbServer.ServerName AS DatabaseServerName
    FROM Clients c
    INNER JOIN ServerTiers t ON c.TierId = t.TierId
    LEFT JOIN Servers appServer ON c.CurrentApplicationServerId = appServer.ServerId
    LEFT JOIN Servers dbServer ON c.CurrentDatabaseServerId = dbServer.ServerId
    WHERE c.TierId = @TierId AND c.IsActive = 1
    ORDER BY c.ClientName;
END
GO

-- =============================================
-- SP: Create Client
-- =============================================
CREATE PROCEDURE sp_CreateClient
    @ClientName NVARCHAR(100),
    @CompanyName NVARCHAR(100),
    @ContactEmail NVARCHAR(100),
    @ContactPhone NVARCHAR(50),
    @CurrentApplicationServerId INT,
    @CurrentDatabaseServerId INT,
    @HostingType NVARCHAR(50),
    @TierId INT,
    @CurrentEntities INT,
    @CurrentTemplates INT,
    @CurrentUsers INT,
    @DiscussedMonthlyFee DECIMAL(10, 2),
    @ActualMonthlyFee DECIMAL(10, 2),
    @StartDate DATE,
    @Status NVARCHAR(50),
    @Notes NVARCHAR(MAX),
    @CreatedByUserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ClientId INT;
    
    -- Insert client
    INSERT INTO Clients (
        ClientName, CompanyName, ContactEmail, ContactPhone,
        CurrentApplicationServerId, CurrentDatabaseServerId, HostingType, TierId,
        CurrentEntities, CurrentTemplates, CurrentUsers,
        DiscussedMonthlyFee, ActualMonthlyFee, StartDate, Status, Notes,
        CreatedByUserId, ModifiedByUserId
    )
    VALUES (
        @ClientName, @CompanyName, @ContactEmail, @ContactPhone,
        @CurrentApplicationServerId, @CurrentDatabaseServerId, @HostingType, @TierId,
        @CurrentEntities, @CurrentTemplates, @CurrentUsers,
        @DiscussedMonthlyFee, @ActualMonthlyFee, @StartDate, @Status, @Notes,
        @CreatedByUserId, @CreatedByUserId
    );
    
    SET @ClientId = SCOPE_IDENTITY();
    
    -- Create initial history record
    INSERT INTO ClientServerHistory (
        ClientId, ApplicationServerId, DatabaseServerId, TierId, HostingType,
        MonthlyFee, StartDate, ChangeReason, CreatedByUserId
    )
    VALUES (
        @ClientId, @CurrentApplicationServerId, @CurrentDatabaseServerId, @TierId, @HostingType,
        @ActualMonthlyFee, CAST(@StartDate AS DATETIME2), 'Initial setup', @CreatedByUserId
    );
    
    -- Update server load
    IF @CurrentApplicationServerId IS NOT NULL
    BEGIN
        UPDATE Servers
        SET CurrentEntities = CurrentEntities + @CurrentEntities,
            CurrentTemplates = CurrentTemplates + @CurrentTemplates,
            CurrentUsers = CurrentUsers + @CurrentUsers,
            ModifiedDate = GETUTCDATE()
        WHERE ServerId = @CurrentApplicationServerId;
    END
    
    IF @CurrentDatabaseServerId IS NOT NULL
    BEGIN
        UPDATE Servers
        SET CurrentEntities = CurrentEntities + @CurrentEntities,
            CurrentTemplates = CurrentTemplates + @CurrentTemplates,
            CurrentUsers = CurrentUsers + @CurrentUsers,
            ModifiedDate = GETUTCDATE()
        WHERE ServerId = @CurrentDatabaseServerId;
    END
    
    -- Return created client
    EXEC sp_GetClientById @ClientId;
END
GO

-- =============================================
-- SP: Update Client
-- =============================================
CREATE PROCEDURE sp_UpdateClient
    @ClientId INT,
    @ClientName NVARCHAR(100),
    @CompanyName NVARCHAR(100),
    @ContactEmail NVARCHAR(100),
    @ContactPhone NVARCHAR(50),
    @DiscussedMonthlyFee DECIMAL(10, 2),
    @ActualMonthlyFee DECIMAL(10, 2),
    @Status NVARCHAR(50),
    @Notes NVARCHAR(MAX),
    @ModifiedByUserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Clients
    SET 
        ClientName = @ClientName,
        CompanyName = @CompanyName,
        ContactEmail = @ContactEmail,
        ContactPhone = @ContactPhone,
        DiscussedMonthlyFee = @DiscussedMonthlyFee,
        ActualMonthlyFee = @ActualMonthlyFee,
        Status = @Status,
        Notes = @Notes,
        ModifiedByUserId = @ModifiedByUserId,
        ModifiedDate = GETUTCDATE()
    WHERE ClientId = @ClientId;
    
    -- Return updated client
    EXEC sp_GetClientById @ClientId;
END
GO

-- =============================================
-- SP: Move Client To Server
-- =============================================
CREATE PROCEDURE sp_MoveClientToServer
    @ClientId INT,
    @NewApplicationServerId INT,
    @NewDatabaseServerId INT,
    @ChangeReason NVARCHAR(MAX),
    @ModifiedByUserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @OldAppServerId INT, @OldDbServerId INT, @TierId INT, @HostingType NVARCHAR(50);
    DECLARE @CurrentEntities INT, @CurrentTemplates INT, @CurrentUsers INT;
    DECLARE @ActualMonthlyFee DECIMAL(10, 2);
    
    -- Get current client info
    SELECT 
        @OldAppServerId = CurrentApplicationServerId,
        @OldDbServerId = CurrentDatabaseServerId,
        @TierId = TierId,
        @HostingType = HostingType,
        @CurrentEntities = CurrentEntities,
        @CurrentTemplates = CurrentTemplates,
        @CurrentUsers = CurrentUsers,
        @ActualMonthlyFee = ActualMonthlyFee
    FROM Clients
    WHERE ClientId = @ClientId;
    
    -- Close current history record
    UPDATE ClientServerHistory
    SET EndDate = GETUTCDATE()
    WHERE ClientId = @ClientId AND EndDate IS NULL;
    
    -- Create new history record
    INSERT INTO ClientServerHistory (
        ClientId, ApplicationServerId, DatabaseServerId, TierId, HostingType,
        MonthlyFee, StartDate, ChangeReason, CreatedByUserId
    )
    VALUES (
        @ClientId, @NewApplicationServerId, @NewDatabaseServerId, @TierId, @HostingType,
        @ActualMonthlyFee, GETUTCDATE(), @ChangeReason, @ModifiedByUserId
    );
    
    -- Decrease load from old servers
    IF @OldAppServerId IS NOT NULL
    BEGIN
        UPDATE Servers
        SET CurrentEntities = CurrentEntities - @CurrentEntities,
            CurrentTemplates = CurrentTemplates - @CurrentTemplates,
            CurrentUsers = CurrentUsers - @CurrentUsers,
            ModifiedDate = GETUTCDATE()
        WHERE ServerId = @OldAppServerId;
    END
    
    IF @OldDbServerId IS NOT NULL
    BEGIN
        UPDATE Servers
        SET CurrentEntities = CurrentEntities - @CurrentEntities,
            CurrentTemplates = CurrentTemplates - @CurrentTemplates,
            CurrentUsers = CurrentUsers - @CurrentUsers,
            ModifiedDate = GETUTCDATE()
        WHERE ServerId = @OldDbServerId;
    END
    
    -- Increase load on new servers
    IF @NewApplicationServerId IS NOT NULL
    BEGIN
        UPDATE Servers
        SET CurrentEntities = CurrentEntities + @CurrentEntities,
            CurrentTemplates = CurrentTemplates + @CurrentTemplates,
            CurrentUsers = CurrentUsers + @CurrentUsers,
            ModifiedDate = GETUTCDATE()
        WHERE ServerId = @NewApplicationServerId;
    END
    
    IF @NewDatabaseServerId IS NOT NULL
    BEGIN
        UPDATE Servers
        SET CurrentEntities = CurrentEntities + @CurrentEntities,
            CurrentTemplates = CurrentTemplates + @CurrentTemplates,
            CurrentUsers = CurrentUsers + @CurrentUsers,
            ModifiedDate = GETUTCDATE()
        WHERE ServerId = @NewDatabaseServerId;
    END
    
    -- Update client's current servers
    UPDATE Clients
    SET 
        CurrentApplicationServerId = @NewApplicationServerId,
        CurrentDatabaseServerId = @NewDatabaseServerId,
        ModifiedByUserId = @ModifiedByUserId,
        ModifiedDate = GETUTCDATE()
    WHERE ClientId = @ClientId;
    
    -- Return updated client
    EXEC sp_GetClientById @ClientId;
END
GO

-- =============================================
-- SP: Update Client Usage
-- =============================================
CREATE PROCEDURE sp_UpdateClientUsage
    @ClientId INT,
    @NewEntities INT,
    @NewTemplates INT,
    @NewUsers INT,
    @ModifiedByUserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @OldEntities INT, @OldTemplates INT, @OldUsers INT;
    DECLARE @AppServerId INT, @DbServerId INT;
    DECLARE @EntityDiff INT, @TemplateDiff INT, @UserDiff INT;
    
    -- Get current usage and servers
    SELECT 
        @OldEntities = CurrentEntities,
        @OldTemplates = CurrentTemplates,
        @OldUsers = CurrentUsers,
        @AppServerId = CurrentApplicationServerId,
        @DbServerId = CurrentDatabaseServerId
    FROM Clients
    WHERE ClientId = @ClientId;
    
    -- Calculate differences
    SET @EntityDiff = @NewEntities - @OldEntities;
    SET @TemplateDiff = @NewTemplates - @OldTemplates;
    SET @UserDiff = @NewUsers - @OldUsers;
    
    -- Update client usage
    UPDATE Clients
    SET 
        CurrentEntities = @NewEntities,
        CurrentTemplates = @NewTemplates,
        CurrentUsers = @NewUsers,
        ModifiedByUserId = @ModifiedByUserId,
        ModifiedDate = GETUTCDATE()
    WHERE ClientId = @ClientId;
    
    -- Update server loads
    IF @AppServerId IS NOT NULL
    BEGIN
        UPDATE Servers
        SET CurrentEntities = CurrentEntities + @EntityDiff,
            CurrentTemplates = CurrentTemplates + @TemplateDiff,
            CurrentUsers = CurrentUsers + @UserDiff,
            ModifiedDate = GETUTCDATE()
        WHERE ServerId = @AppServerId;
    END
    
    IF @DbServerId IS NOT NULL
    BEGIN
        UPDATE Servers
        SET CurrentEntities = CurrentEntities + @EntityDiff,
            CurrentTemplates = CurrentTemplates + @TemplateDiff,
            CurrentUsers = CurrentUsers + @UserDiff,
            ModifiedDate = GETUTCDATE()
        WHERE ServerId = @DbServerId;
    END
    
    -- Return updated client
    EXEC sp_GetClientById @ClientId;
END
GO

-- =============================================
-- SP: Delete Client (Soft Delete)
-- =============================================
CREATE PROCEDURE sp_DeleteClient
    @ClientId INT,
    @ModifiedByUserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @AppServerId INT, @DbServerId INT;
    DECLARE @CurrentEntities INT, @CurrentTemplates INT, @CurrentUsers INT;
    
    -- Get client info
    SELECT 
        @AppServerId = CurrentApplicationServerId,
        @DbServerId = CurrentDatabaseServerId,
        @CurrentEntities = CurrentEntities,
        @CurrentTemplates = CurrentTemplates,
        @CurrentUsers = CurrentUsers
    FROM Clients
    WHERE ClientId = @ClientId;
    
    -- Decrease server loads
    IF @AppServerId IS NOT NULL
    BEGIN
        UPDATE Servers
        SET CurrentEntities = CurrentEntities - @CurrentEntities,
            CurrentTemplates = CurrentTemplates - @CurrentTemplates,
            CurrentUsers = CurrentUsers - @CurrentUsers,
            ModifiedDate = GETUTCDATE()
        WHERE ServerId = @AppServerId;
    END
    
    IF @DbServerId IS NOT NULL
    BEGIN
        UPDATE Servers
        SET CurrentEntities = CurrentEntities - @CurrentEntities,
            CurrentTemplates = CurrentTemplates - @CurrentTemplates,
            CurrentUsers = CurrentUsers - @CurrentUsers,
            ModifiedDate = GETUTCDATE()
        WHERE ServerId = @DbServerId;
    END
    
    -- Close current history record
    UPDATE ClientServerHistory
    SET EndDate = GETUTCDATE()
    WHERE ClientId = @ClientId AND EndDate IS NULL;
    
    -- Soft delete client
    UPDATE Clients
    SET 
        IsActive = 0,
        EndDate = GETDATE(),
        ModifiedByUserId = @ModifiedByUserId,
        ModifiedDate = GETUTCDATE()
    WHERE ClientId = @ClientId;
END
GO

-- =============================================
-- SP: Get Client History
-- =============================================
CREATE PROCEDURE sp_GetClientHistory
    @ClientId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        h.HistoryId,
        h.ClientId,
        h.ApplicationServerId,
        h.DatabaseServerId,
        h.TierId,
        t.TierName,
        t.DisplayName AS TierDisplayName,
        h.HostingType,
        h.MonthlyFee,
        h.StartDate,
        h.EndDate,
        h.ChangeReason,
        h.CreatedDate,
        appServer.ServerName AS ApplicationServerName,
        dbServer.ServerName AS DatabaseServerName
    FROM ClientServerHistory h
    INNER JOIN ServerTiers t ON h.TierId = t.TierId
    LEFT JOIN Servers appServer ON h.ApplicationServerId = appServer.ServerId
    LEFT JOIN Servers dbServer ON h.DatabaseServerId = dbServer.ServerId
    WHERE h.ClientId = @ClientId
    ORDER BY h.StartDate DESC;
END
GO

-- =============================================
-- SP: Get Client Statistics
-- =============================================
CREATE PROCEDURE sp_GetClientStatistics
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        COUNT(*) AS TotalClients,
        COUNT(CASE WHEN Status = 'active' THEN 1 END) AS ActiveClients,
        COUNT(CASE WHEN Status = 'suspended' THEN 1 END) AS SuspendedClients,
        COUNT(CASE WHEN Status = 'cancelled' THEN 1 END) AS CancelledClients,
        COUNT(CASE WHEN HostingType = 'Shared' THEN 1 END) AS SharedHostingClients,
        COUNT(CASE WHEN HostingType = 'Dedicated' THEN 1 END) AS DedicatedHostingClients,
        SUM(ActualMonthlyFee) AS TotalMonthlyRevenue,
        AVG(ActualMonthlyFee) AS AverageMonthlyFee
    FROM Clients
    WHERE IsActive = 1;
END
GO
