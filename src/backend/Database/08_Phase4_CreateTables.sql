-- =============================================
-- Phase 4: Client Management
-- Tables: Clients, ClientServerHistory
-- =============================================

-- Create Clients Table
CREATE TABLE Clients (
    ClientId INT PRIMARY KEY IDENTITY(1,1),
    ClientName NVARCHAR(100) NOT NULL,
    CompanyName NVARCHAR(100),
    ContactEmail NVARCHAR(100) NOT NULL,
    ContactPhone NVARCHAR(50),
    
    -- Current Hosting Configuration
    CurrentApplicationServerId INT NULL,
    CurrentDatabaseServerId INT NULL,
    HostingType NVARCHAR(50) NOT NULL, -- 'Shared' or 'Dedicated'
    TierId INT NOT NULL,
    
    -- Current Usage
    CurrentEntities INT DEFAULT 0,
    CurrentTemplates INT DEFAULT 0,
    CurrentUsers INT DEFAULT 0,
    
    -- Pricing
    DiscussedMonthlyFee DECIMAL(10, 2) NULL,
    ActualMonthlyFee DECIMAL(10, 2) NOT NULL,
    
    -- Dates
    StartDate DATE NOT NULL,
    EndDate DATE NULL,
    
    -- Status
    Status NVARCHAR(50) DEFAULT 'active', -- 'active', 'suspended', 'cancelled'
    
    -- Metadata
    IsActive BIT DEFAULT 1,
    CreatedDate DATETIME2 DEFAULT GETUTCDATE(),
    ModifiedDate DATETIME2 DEFAULT GETUTCDATE(),
    CreatedByUserId INT NULL,
    ModifiedByUserId INT NULL,
    Notes NVARCHAR(MAX),
    
    CONSTRAINT FK_Clients_Tier FOREIGN KEY (TierId) REFERENCES ServerTiers(TierId),
    CONSTRAINT FK_Clients_AppServer FOREIGN KEY (CurrentApplicationServerId) REFERENCES Servers(ServerId),
    CONSTRAINT FK_Clients_DbServer FOREIGN KEY (CurrentDatabaseServerId) REFERENCES Servers(ServerId),
    CONSTRAINT FK_Clients_CreatedBy FOREIGN KEY (CreatedByUserId) REFERENCES Users(UserId),
    CONSTRAINT FK_Clients_ModifiedBy FOREIGN KEY (ModifiedByUserId) REFERENCES Users(UserId)
);

-- Create ClientServerHistory Table
CREATE TABLE ClientServerHistory (
    HistoryId INT PRIMARY KEY IDENTITY(1,1),
    ClientId INT NOT NULL,
    ApplicationServerId INT NULL,
    DatabaseServerId INT NULL,
    TierId INT NOT NULL,
    HostingType NVARCHAR(50) NOT NULL,
    
    -- Fees at the time
    MonthlyFee DECIMAL(10, 2) NOT NULL,
    
    -- Period
    StartDate DATETIME2 NOT NULL,
    EndDate DATETIME2 NULL,
    
    -- Reason for change
    ChangeReason NVARCHAR(MAX),
    
    -- Metadata
    CreatedDate DATETIME2 DEFAULT GETUTCDATE(),
    CreatedByUserId INT NULL,
    
    CONSTRAINT FK_ClientHistory_Client FOREIGN KEY (ClientId) REFERENCES Clients(ClientId),
    CONSTRAINT FK_ClientHistory_Tier FOREIGN KEY (TierId) REFERENCES ServerTiers(TierId),
    CONSTRAINT FK_ClientHistory_AppServer FOREIGN KEY (ApplicationServerId) REFERENCES Servers(ServerId),
    CONSTRAINT FK_ClientHistory_DbServer FOREIGN KEY (DatabaseServerId) REFERENCES Servers(ServerId),
    CONSTRAINT FK_ClientHistory_CreatedBy FOREIGN KEY (CreatedByUserId) REFERENCES Users(UserId)
);

-- Create Indexes
CREATE INDEX IX_Clients_TierId ON Clients(TierId);
CREATE INDEX IX_Clients_AppServerId ON Clients(CurrentApplicationServerId);
CREATE INDEX IX_Clients_DbServerId ON Clients(CurrentDatabaseServerId);
CREATE INDEX IX_Clients_Status ON Clients(Status);
CREATE INDEX IX_Clients_IsActive ON Clients(IsActive);

CREATE INDEX IX_ClientHistory_ClientId ON ClientServerHistory(ClientId);
CREATE INDEX IX_ClientHistory_StartDate ON ClientServerHistory(StartDate);

-- Insert Sample Data
DECLARE @SmallTierId INT = (SELECT TierId FROM ServerTiers WHERE TierName = 'small');
DECLARE @MediumTierId INT = (SELECT TierId FROM ServerTiers WHERE TierName = 'medium');
DECLARE @LargeTierId INT = (SELECT TierId FROM ServerTiers WHERE TierName = 'large');

DECLARE @AppSmall01 INT = (SELECT ServerId FROM Servers WHERE ServerName = 'APP-SMALL-01');
DECLARE @DbSmall01 INT = (SELECT ServerId FROM Servers WHERE ServerName = 'DB-SMALL-01');
DECLARE @AppMedium01 INT = (SELECT ServerId FROM Servers WHERE ServerName = 'APP-MEDIUM-01');
DECLARE @DbMedium01 INT = (SELECT ServerId FROM Servers WHERE ServerName = 'DB-MEDIUM-01');
DECLARE @AppMedium02 INT = (SELECT ServerId FROM Servers WHERE ServerName = 'APP-MEDIUM-02');
DECLARE @DbMedium02 INT = (SELECT ServerId FROM Servers WHERE ServerName = 'DB-MEDIUM-02');
DECLARE @AppLarge01 INT = (SELECT ServerId FROM Servers WHERE ServerName = 'APP-LARGE-01');
DECLARE @DbLarge01 INT = (SELECT ServerId FROM Servers WHERE ServerName = 'DB-LARGE-01');

INSERT INTO Clients (ClientName, CompanyName, ContactEmail, ContactPhone, CurrentApplicationServerId, CurrentDatabaseServerId, HostingType, TierId, CurrentEntities, CurrentTemplates, CurrentUsers, DiscussedMonthlyFee, ActualMonthlyFee, StartDate, Status, CreatedByUserId, ModifiedByUserId)
VALUES 
-- Small Tier Clients
('Acme Corp', 'Acme Corporation', 'contact@acme.com', '555-0101', @AppSmall01, @DbSmall01, 'Shared', @SmallTierId, 45, 20, 5, 125.00, 120.00, '2024-01-15', 'active', 1, 1),
('Tech Startup LLC', 'Tech Startup', 'info@techstartup.com', '555-0102', @AppSmall01, @DbSmall01, 'Shared', @SmallTierId, 38, 15, 3, 120.00, 120.00, '2024-02-01', 'active', 1, 1),

-- Medium Tier Clients
('Global Services Inc', 'Global Services', 'admin@globalservices.com', '555-0201', @AppMedium01, @DbMedium01, 'Shared', @MediumTierId, 280, 120, 28, 450.00, 425.00, '2023-11-10', 'active', 1, 1),
('Enterprise Solutions', 'Enterprise Solutions Co', 'contact@enterprise.com', '555-0202', @AppMedium01, @DbMedium01, 'Shared', @MediumTierId, 195, 85, 18, 425.00, 425.00, '2024-03-05', 'active', 1, 1),
('Premium Client Ltd', 'Premium Client Limited', 'hello@premiumclient.com', '555-0203', @AppMedium02, @DbMedium02, 'Dedicated', @MediumTierId, 320, 150, 35, 900.00, 850.00, '2023-09-20', 'active', 1, 1),

-- Large Tier Clients
('MegaCorp International', 'MegaCorp Inc', 'it@megacorp.com', '555-0301', @AppLarge01, @DbLarge01, 'Dedicated', @LargeTierId, 1250, 600, 95, 1800.00, 1700.00, '2023-06-01', 'active', 1, 1),
('BigBusiness Group', 'BigBusiness Holdings', 'ops@bigbusiness.com', '555-0302', @AppLarge01, @DbLarge01, 'Dedicated', @LargeTierId, 980, 450, 75, 1700.00, 1700.00, '2023-08-15', 'active', 1, 1);

-- Insert Initial History Records
INSERT INTO ClientServerHistory (ClientId, ApplicationServerId, DatabaseServerId, TierId, HostingType, MonthlyFee, StartDate, ChangeReason, CreatedByUserId)
SELECT 
    ClientId,
    CurrentApplicationServerId,
    CurrentDatabaseServerId,
    TierId,
    HostingType,
    ActualMonthlyFee,
    CAST(StartDate AS DATETIME2),
    'Initial setup',
    CreatedByUserId
FROM Clients;

-- Add a historical move for one client
DECLARE @MigratedClientId INT = (SELECT ClientId FROM Clients WHERE CompanyName = 'Premium Client Limited');

-- Insert old history (they were on shared before moving to dedicated)
INSERT INTO ClientServerHistory (ClientId, ApplicationServerId, DatabaseServerId, TierId, HostingType, MonthlyFee, StartDate, EndDate, ChangeReason, CreatedByUserId)
VALUES (@MigratedClientId, @AppMedium01, @DbMedium01, @MediumTierId, 'Shared', 425.00, '2023-06-01', '2023-09-19', 'Client upgraded to dedicated hosting for better performance', 1);

-- Update the existing history record to have correct start date
UPDATE ClientServerHistory 
SET StartDate = '2023-09-20' 
WHERE ClientId = @MigratedClientId 
AND EndDate IS NULL;
