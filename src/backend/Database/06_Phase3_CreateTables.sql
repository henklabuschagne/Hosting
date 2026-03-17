-- =============================================
-- Phase 3: Server Management
-- Tables: Servers
-- =============================================

-- Create Servers Table
CREATE TABLE Servers (
    ServerId INT PRIMARY KEY IDENTITY(1,1),
    ServerName NVARCHAR(100) NOT NULL,
    TierId INT NOT NULL,
    ServerType NVARCHAR(50) NOT NULL, -- 'Application' or 'Database'
    HostingType NVARCHAR(50) NOT NULL, -- 'Shared' or 'Dedicated'
    
    -- Server Specifications
    CpuCores INT NOT NULL,
    RamGB INT NOT NULL,
    StorageGB INT NOT NULL,
    Location NVARCHAR(100),
    IpAddress NVARCHAR(50),
    
    -- Current Load/Usage
    CurrentEntities INT DEFAULT 0,
    CurrentTemplates INT DEFAULT 0,
    CurrentUsers INT DEFAULT 0,
    
    -- Status
    Status NVARCHAR(50) DEFAULT 'active', -- 'active', 'maintenance', 'inactive'
    
    -- Metadata
    IsActive BIT DEFAULT 1,
    CreatedDate DATETIME2 DEFAULT GETUTCDATE(),
    ModifiedDate DATETIME2 DEFAULT GETUTCDATE(),
    CreatedByUserId INT NULL,
    ModifiedByUserId INT NULL,
    Notes NVARCHAR(MAX),
    
    CONSTRAINT FK_Servers_Tier FOREIGN KEY (TierId) REFERENCES ServerTiers(TierId),
    CONSTRAINT FK_Servers_CreatedBy FOREIGN KEY (CreatedByUserId) REFERENCES Users(UserId),
    CONSTRAINT FK_Servers_ModifiedBy FOREIGN KEY (ModifiedByUserId) REFERENCES Users(UserId)
);

-- Create Indexes
CREATE INDEX IX_Servers_TierId ON Servers(TierId);
CREATE INDEX IX_Servers_ServerType ON Servers(ServerType);
CREATE INDEX IX_Servers_HostingType ON Servers(HostingType);
CREATE INDEX IX_Servers_Status ON Servers(Status);
CREATE INDEX IX_Servers_IsActive ON Servers(IsActive);

-- Insert Sample Data
INSERT INTO Servers (ServerName, TierId, ServerType, HostingType, CpuCores, RamGB, StorageGB, Location, IpAddress, Status, CreatedByUserId, ModifiedByUserId)
VALUES 
-- Small Tier Servers
('APP-SMALL-01', (SELECT TierId FROM ServerTiers WHERE TierName = 'small'), 'Application', 'Shared', 2, 4, 50, 'US-East-1', '10.0.1.10', 'active', 1, 1),
('DB-SMALL-01', (SELECT TierId FROM ServerTiers WHERE TierName = 'small'), 'Database', 'Shared', 2, 8, 100, 'US-East-1', '10.0.1.20', 'active', 1, 1),

-- Medium Tier Servers
('APP-MEDIUM-01', (SELECT TierId FROM ServerTiers WHERE TierName = 'medium'), 'Application', 'Shared', 4, 8, 100, 'US-West-1', '10.0.2.10', 'active', 1, 1),
('DB-MEDIUM-01', (SELECT TierId FROM ServerTiers WHERE TierName = 'medium'), 'Database', 'Shared', 4, 16, 250, 'US-West-1', '10.0.2.20', 'active', 1, 1),

('APP-MEDIUM-02', (SELECT TierId FROM ServerTiers WHERE TierName = 'medium'), 'Application', 'Dedicated', 4, 8, 100, 'EU-West-1', '10.0.3.10', 'active', 1, 1),
('DB-MEDIUM-02', (SELECT TierId FROM ServerTiers WHERE TierName = 'medium'), 'Database', 'Dedicated', 4, 16, 250, 'EU-West-1', '10.0.3.20', 'active', 1, 1),

-- Large Tier Servers
('APP-LARGE-01', (SELECT TierId FROM ServerTiers WHERE TierName = 'large'), 'Application', 'Dedicated', 8, 16, 250, 'US-East-1', '10.0.4.10', 'active', 1, 1),
('DB-LARGE-01', (SELECT TierId FROM ServerTiers WHERE TierName = 'large'), 'Database', 'Dedicated', 8, 32, 500, 'US-East-1', '10.0.4.20', 'active', 1, 1);

-- Update some servers with current load
UPDATE Servers SET CurrentEntities = 45, CurrentTemplates = 20, CurrentUsers = 5 WHERE ServerName = 'APP-SMALL-01';
UPDATE Servers SET CurrentEntities = 45, CurrentTemplates = 20, CurrentUsers = 5 WHERE ServerName = 'DB-SMALL-01';

UPDATE Servers SET CurrentEntities = 280, CurrentTemplates = 120, CurrentUsers = 28 WHERE ServerName = 'APP-MEDIUM-01';
UPDATE Servers SET CurrentEntities = 280, CurrentTemplates = 120, CurrentUsers = 28 WHERE ServerName = 'DB-MEDIUM-01';

UPDATE Servers SET CurrentEntities = 320, CurrentTemplates = 150, CurrentUsers = 35 WHERE ServerName = 'APP-MEDIUM-02';
UPDATE Servers SET CurrentEntities = 320, CurrentTemplates = 150, CurrentUsers = 35 WHERE ServerName = 'DB-MEDIUM-02';

UPDATE Servers SET CurrentEntities = 1250, CurrentTemplates = 600, CurrentUsers = 95 WHERE ServerName = 'APP-LARGE-01';
UPDATE Servers SET CurrentEntities = 1250, CurrentTemplates = 600, CurrentUsers = 95 WHERE ServerName = 'DB-LARGE-01';
