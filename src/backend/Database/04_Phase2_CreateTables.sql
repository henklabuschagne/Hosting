-- =============================================
-- Phase 2: Server Tier Configuration
-- Tables: ServerTiers, ServerTierSpecs
-- =============================================

-- Create ServerTiers Table
CREATE TABLE ServerTiers (
    TierId INT PRIMARY KEY IDENTITY(1,1),
    TierName NVARCHAR(50) NOT NULL UNIQUE,
    DisplayName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    IsActive BIT DEFAULT 1,
    CreatedDate DATETIME2 DEFAULT GETUTCDATE(),
    ModifiedDate DATETIME2 DEFAULT GETUTCDATE(),
    CreatedByUserId INT NULL,
    ModifiedByUserId INT NULL,
    CONSTRAINT FK_ServerTiers_CreatedBy FOREIGN KEY (CreatedByUserId) REFERENCES Users(UserId),
    CONSTRAINT FK_ServerTiers_ModifiedBy FOREIGN KEY (ModifiedByUserId) REFERENCES Users(UserId)
);

-- Create ServerTierSpecs Table (One record per tier per server type)
CREATE TABLE ServerTierSpecs (
    SpecId INT PRIMARY KEY IDENTITY(1,1),
    TierId INT NOT NULL,
    ServerType NVARCHAR(50) NOT NULL, -- 'Application' or 'Database'
    
    -- Resource Specifications
    CpuCores INT NOT NULL,
    RamGB INT NOT NULL,
    StorageGB INT NOT NULL,
    
    -- Backup Configuration
    BackupEnabled BIT DEFAULT 1,
    BackupFrequency NVARCHAR(50), -- 'Daily', 'Weekly', 'Monthly'
    BackupRetentionDays INT,
    
    -- Network Configuration
    BandwidthMbps INT,
    PublicIpIncluded BIT DEFAULT 0,
    
    -- Capacity Limits
    MaxEntities INT,
    MaxTemplates INT,
    MaxUsers INT,
    
    -- Pricing
    MonthlyPrice DECIMAL(10, 2),
    
    CreatedDate DATETIME2 DEFAULT GETUTCDATE(),
    ModifiedDate DATETIME2 DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_ServerTierSpecs_Tier FOREIGN KEY (TierId) REFERENCES ServerTiers(TierId) ON DELETE CASCADE,
    CONSTRAINT UQ_TierSpecs UNIQUE (TierId, ServerType)
);

-- Create Indexes
CREATE INDEX IX_ServerTiers_TierName ON ServerTiers(TierName);
CREATE INDEX IX_ServerTiers_IsActive ON ServerTiers(IsActive);
CREATE INDEX IX_ServerTierSpecs_TierId ON ServerTierSpecs(TierId);
CREATE INDEX IX_ServerTierSpecs_ServerType ON ServerTierSpecs(ServerType);

-- Insert Default Tier Configurations
INSERT INTO ServerTiers (TierName, DisplayName, Description) VALUES 
('small', 'Small', 'Entry-level hosting for small applications'),
('medium', 'Medium', 'Standard hosting for growing applications'),
('large', 'Large', 'Enterprise-level hosting for large-scale applications');

-- Insert Default Specifications for Small Tier
INSERT INTO ServerTierSpecs (TierId, ServerType, CpuCores, RamGB, StorageGB, BackupEnabled, BackupFrequency, BackupRetentionDays, BandwidthMbps, PublicIpIncluded, MaxEntities, MaxTemplates, MaxUsers, MonthlyPrice)
VALUES 
-- Small - Application Server
((SELECT TierId FROM ServerTiers WHERE TierName = 'small'), 'Application', 2, 4, 50, 1, 'Daily', 7, 100, 1, 100, 50, 10, 99.00),
-- Small - Database Server
((SELECT TierId FROM ServerTiers WHERE TierName = 'small'), 'Database', 2, 8, 100, 1, 'Daily', 7, 100, 0, 100, 50, 10, 149.00);

-- Insert Default Specifications for Medium Tier
INSERT INTO ServerTierSpecs (TierId, ServerType, CpuCores, RamGB, StorageGB, BackupEnabled, BackupFrequency, BackupRetentionDays, BandwidthMbps, PublicIpIncluded, MaxEntities, MaxTemplates, MaxUsers, MonthlyPrice)
VALUES 
-- Medium - Application Server
((SELECT TierId FROM ServerTiers WHERE TierName = 'medium'), 'Application', 4, 8, 100, 1, 'Daily', 14, 250, 1, 500, 200, 50, 199.00),
-- Medium - Database Server
((SELECT TierId FROM ServerTiers WHERE TierName = 'medium'), 'Database', 4, 16, 250, 1, 'Daily', 14, 250, 0, 500, 200, 50, 299.00);

-- Insert Default Specifications for Large Tier
INSERT INTO ServerTierSpecs (TierId, ServerType, CpuCores, RamGB, StorageGB, BackupEnabled, BackupFrequency, BackupRetentionDays, BandwidthMbps, PublicIpIncluded, MaxEntities, MaxTemplates, MaxUsers, MonthlyPrice)
VALUES 
-- Large - Application Server
((SELECT TierId FROM ServerTiers WHERE TierName = 'large'), 'Application', 8, 16, 250, 1, 'Daily', 30, 500, 1, 2000, 1000, 200, 399.00),
-- Large - Database Server
((SELECT TierId FROM ServerTiers WHERE TierName = 'large'), 'Database', 8, 32, 500, 1, 'Daily', 30, 500, 0, 2000, 1000, 200, 599.00);
