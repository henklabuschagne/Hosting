-- =============================================
-- Hosting Platform Management System
-- Seed Data Script
-- =============================================

USE HostingPlatformDB;
GO

-- =============================================
-- Seed Users
-- Default password for all users: "Password123!"
-- Hash generated for demo purposes
-- =============================================
IF NOT EXISTS (SELECT * FROM Users)
BEGIN
    INSERT INTO Users (Username, PasswordHash, Role, Email)
    VALUES 
        ('admin', '$2a$11$YourHashedPasswordHere', 'Admin', 'admin@hostingplatform.com'),
        ('user1', '$2a$11$YourHashedPasswordHere', 'User', 'user1@hostingplatform.com'),
        ('user2', '$2a$11$YourHashedPasswordHere', 'User', 'user2@hostingplatform.com');
    
    PRINT 'Users seeded successfully!';
END
GO

-- =============================================
-- Seed Server Tiers
-- =============================================
IF NOT EXISTS (SELECT * FROM ServerTiers)
BEGIN
    INSERT INTO ServerTiers (TierName, DisplayName, MaxEntities, MaxTemplates, MaxUsers, PricePerMonth, Description)
    VALUES 
        ('small', 'Small Tier', 10000, 500, 100, 500.00, 'Perfect for small businesses and startups'),
        ('medium', 'Medium Tier', 50000, 2000, 500, 1500.00, 'Ideal for growing companies with moderate needs'),
        ('large', 'Large Tier', 200000, 10000, 2000, 3500.00, 'Enterprise-grade solution for large organizations');
    
    PRINT 'Server Tiers seeded successfully!';
END
GO

-- =============================================
-- Seed Servers
-- =============================================
IF NOT EXISTS (SELECT * FROM Servers)
BEGIN
    DECLARE @SmallTierId INT = (SELECT TierId FROM ServerTiers WHERE TierName = 'small');
    DECLARE @MediumTierId INT = (SELECT TierId FROM ServerTiers WHERE TierName = 'medium');
    DECLARE @LargeTierId INT = (SELECT TierId FROM ServerTiers WHERE TierName = 'large');

    INSERT INTO Servers (ServerName, ServerType, TierId, MaxEntities, MaxTemplates, MaxUsers, IPAddress, Location, Status)
    VALUES 
        -- Small Tier Servers
        ('SMALL-APP-01', 'Application', @SmallTierId, 10000, 500, 100, '192.168.1.10', 'US-East-1', 'Active'),
        ('SMALL-DB-01', 'Database', @SmallTierId, 10000, 500, 100, '192.168.1.11', 'US-East-1', 'Active'),
        ('SMALL-APP-02', 'Application', @SmallTierId, 10000, 500, 100, '192.168.1.20', 'US-West-1', 'Active'),
        ('SMALL-DB-02', 'Database', @SmallTierId, 10000, 500, 100, '192.168.1.21', 'US-West-1', 'Active'),
        
        -- Medium Tier Servers
        ('MEDIUM-APP-01', 'Application', @MediumTierId, 50000, 2000, 500, '192.168.2.10', 'US-East-1', 'Active'),
        ('MEDIUM-DB-01', 'Database', @MediumTierId, 50000, 2000, 500, '192.168.2.11', 'US-East-1', 'Active'),
        ('MEDIUM-APP-02', 'Application', @MediumTierId, 50000, 2000, 500, '192.168.2.20', 'EU-West-1', 'Active'),
        ('MEDIUM-DB-02', 'Database', @MediumTierId, 50000, 2000, 500, '192.168.2.21', 'EU-West-1', 'Active'),
        
        -- Large Tier Servers
        ('LARGE-APP-01', 'Application', @LargeTierId, 200000, 10000, 2000, '192.168.3.10', 'US-East-1', 'Active'),
        ('LARGE-DB-01', 'Database', @LargeTierId, 200000, 10000, 2000, '192.168.3.11', 'US-East-1', 'Active'),
        ('LARGE-APP-02', 'Application', @LargeTierId, 200000, 10000, 2000, '192.168.3.20', 'EU-Central-1', 'Active'),
        ('LARGE-DB-02', 'Database', @LargeTierId, 200000, 10000, 2000, '192.168.3.21', 'EU-Central-1', 'Active');
    
    PRINT 'Servers seeded successfully!';
END
GO

-- =============================================
-- Seed Clients
-- =============================================
IF NOT EXISTS (SELECT * FROM Clients)
BEGIN
    DECLARE @SmallTierId INT = (SELECT TierId FROM ServerTiers WHERE TierName = 'small');
    DECLARE @MediumTierId INT = (SELECT TierId FROM ServerTiers WHERE TierName = 'medium');
    DECLARE @LargeTierId INT = (SELECT TierId FROM ServerTiers WHERE TierName = 'large');

    INSERT INTO Clients (ClientName, TierId, HostingType, CurrentEntities, CurrentTemplates, CurrentUsers, DiscussedMonthlyFee, ActualMonthlyFee, Status, ContactEmail)
    VALUES 
        -- Small Tier Clients
        ('Acme Corp', @SmallTierId, 'Dedicated', 7500, 350, 75, 500.00, 500.00, 'active', 'contact@acmecorp.com'),
        ('Tech Solutions Inc', @SmallTierId, 'Shared', 4200, 200, 45, 450.00, 475.00, 'active', 'info@techsolutions.com'),
        ('Global Services Ltd', @SmallTierId, 'Shared', 3800, 180, 40, 450.00, 450.00, 'active', 'admin@globalservices.com'),
        
        -- Medium Tier Clients
        ('Enterprise Systems', @MediumTierId, 'Dedicated', 35000, 1500, 350, 1500.00, 1500.00, 'active', 'contact@enterprise.com'),
        ('Digital Innovations', @MediumTierId, 'Dedicated', 28000, 1200, 280, 1500.00, 1450.00, 'active', 'hello@digitalinnovations.com'),
        ('Cloud Services Pro', @MediumTierId, 'Shared', 22000, 900, 220, 1400.00, 1500.00, 'active', 'support@cloudservices.com'),
        ('DataTech Solutions', @MediumTierId, 'Shared', 18000, 800, 180, 1400.00, 1400.00, 'suspended', 'billing@datatech.com'),
        
        -- Large Tier Clients
        ('MegaCorp International', @LargeTierId, 'Dedicated', 150000, 7000, 1500, 3500.00, 3500.00, 'active', 'enterprise@megacorp.com'),
        ('Global Tech Alliance', @LargeTierId, 'Dedicated', 120000, 5500, 1200, 3500.00, 3400.00, 'active', 'admin@globaltech.com'),
        ('Innovation Labs', @LargeTierId, 'Shared', 95000, 4200, 900, 3200.00, 3500.00, 'active', 'contact@innovationlabs.com'),
        
        -- Mixed Status
        ('Startup Hub', @SmallTierId, 'Shared', 2500, 120, 25, 400.00, 450.00, 'cancelled', 'info@startuphub.com'),
        ('Beta Testers Co', @MediumTierId, 'Shared', 15000, 650, 150, 1300.00, 1500.00, 'suspended', 'beta@testers.com');
    
    PRINT 'Clients seeded successfully!';
END
GO

-- =============================================
-- Seed Client-Server Assignments
-- =============================================
IF NOT EXISTS (SELECT * FROM ClientServerAssignments)
BEGIN
    -- Assign Acme Corp to SMALL-APP-01 and SMALL-DB-01
    INSERT INTO ClientServerAssignments (ClientId, ServerId, IsActive)
    SELECT c.ClientId, s.ServerId, 1
    FROM Clients c
    CROSS JOIN Servers s
    WHERE c.ClientName = 'Acme Corp' AND s.ServerName IN ('SMALL-APP-01', 'SMALL-DB-01');

    -- Assign Tech Solutions to SMALL-APP-02 and SMALL-DB-02
    INSERT INTO ClientServerAssignments (ClientId, ServerId, IsActive)
    SELECT c.ClientId, s.ServerId, 1
    FROM Clients c
    CROSS JOIN Servers s
    WHERE c.ClientName = 'Tech Solutions Inc' AND s.ServerName IN ('SMALL-APP-02', 'SMALL-DB-02');

    -- Assign Global Services to SMALL-APP-02 and SMALL-DB-02 (Shared)
    INSERT INTO ClientServerAssignments (ClientId, ServerId, IsActive)
    SELECT c.ClientId, s.ServerId, 1
    FROM Clients c
    CROSS JOIN Servers s
    WHERE c.ClientName = 'Global Services Ltd' AND s.ServerName IN ('SMALL-APP-02', 'SMALL-DB-02');

    -- Assign Enterprise Systems to MEDIUM-APP-01 and MEDIUM-DB-01
    INSERT INTO ClientServerAssignments (ClientId, ServerId, IsActive)
    SELECT c.ClientId, s.ServerId, 1
    FROM Clients c
    CROSS JOIN Servers s
    WHERE c.ClientName = 'Enterprise Systems' AND s.ServerName IN ('MEDIUM-APP-01', 'MEDIUM-DB-01');

    -- Assign Digital Innovations to MEDIUM-APP-02 and MEDIUM-DB-02
    INSERT INTO ClientServerAssignments (ClientId, ServerId, IsActive)
    SELECT c.ClientId, s.ServerId, 1
    FROM Clients c
    CROSS JOIN Servers s
    WHERE c.ClientName = 'Digital Innovations' AND s.ServerName IN ('MEDIUM-APP-02', 'MEDIUM-DB-02');

    -- Assign Cloud Services Pro to MEDIUM-APP-02 and MEDIUM-DB-02 (Shared)
    INSERT INTO ClientServerAssignments (ClientId, ServerId, IsActive)
    SELECT c.ClientId, s.ServerId, 1
    FROM Clients c
    CROSS JOIN Servers s
    WHERE c.ClientName = 'Cloud Services Pro' AND s.ServerName IN ('MEDIUM-APP-02', 'MEDIUM-DB-02');

    -- Assign DataTech to MEDIUM-APP-01 and MEDIUM-DB-01 (Shared)
    INSERT INTO ClientServerAssignments (ClientId, ServerId, IsActive)
    SELECT c.ClientId, s.ServerId, 1
    FROM Clients c
    CROSS JOIN Servers s
    WHERE c.ClientName = 'DataTech Solutions' AND s.ServerName IN ('MEDIUM-APP-01', 'MEDIUM-DB-01');

    -- Assign MegaCorp to LARGE-APP-01 and LARGE-DB-01
    INSERT INTO ClientServerAssignments (ClientId, ServerId, IsActive)
    SELECT c.ClientId, s.ServerId, 1
    FROM Clients c
    CROSS JOIN Servers s
    WHERE c.ClientName = 'MegaCorp International' AND s.ServerName IN ('LARGE-APP-01', 'LARGE-DB-01');

    -- Assign Global Tech to LARGE-APP-02 and LARGE-DB-02
    INSERT INTO ClientServerAssignments (ClientId, ServerId, IsActive)
    SELECT c.ClientId, s.ServerId, 1
    FROM Clients c
    CROSS JOIN Servers s
    WHERE c.ClientName = 'Global Tech Alliance' AND s.ServerName IN ('LARGE-APP-02', 'LARGE-DB-02');

    -- Assign Innovation Labs to LARGE-APP-02 and LARGE-DB-02 (Shared)
    INSERT INTO ClientServerAssignments (ClientId, ServerId, IsActive)
    SELECT c.ClientId, s.ServerId, 1
    FROM Clients c
    CROSS JOIN Servers s
    WHERE c.ClientName = 'Innovation Labs' AND s.ServerName IN ('LARGE-APP-02', 'LARGE-DB-02');

    PRINT 'Client-Server Assignments seeded successfully!';
END
GO

-- =============================================
-- Seed Tier Recommendation Requests
-- =============================================
IF NOT EXISTS (SELECT * FROM TierRecommendationRequests)
BEGIN
    DECLARE @SmallTierId INT = (SELECT TierId FROM ServerTiers WHERE TierName = 'small');
    DECLARE @MediumTierId INT = (SELECT TierId FROM ServerTiers WHERE TierName = 'medium');
    DECLARE @LargeTierId INT = (SELECT TierId FROM ServerTiers WHERE TierName = 'large');

    INSERT INTO TierRecommendationRequests (CustomerName, CustomerEmail, RequestedEntities, RequestedTemplates, RequestedUsers, RecommendedTierId, RecommendedTierName, EstimatedMonthlyCost, Status)
    VALUES 
        ('New Startup LLC', 'contact@newstartup.com', 5000, 250, 50, @SmallTierId, 'Small Tier', 500.00, 'pending'),
        ('Growing Business Inc', 'info@growingbiz.com', 25000, 1000, 250, @MediumTierId, 'Medium Tier', 1500.00, 'reviewed'),
        ('Enterprise Prospect', 'sales@enterprise.com', 100000, 5000, 1000, @LargeTierId, 'Large Tier', 3500.00, 'pending'),
        ('Small Shop', 'owner@smallshop.com', 3000, 150, 30, @SmallTierId, 'Small Tier', 500.00, 'converted'),
        ('Mid-Size Corp', 'admin@midsize.com', 40000, 1800, 400, @MediumTierId, 'Medium Tier', 1500.00, 'declined');
    
    PRINT 'Tier Recommendation Requests seeded successfully!';
END
GO

PRINT 'All seed data inserted successfully!';
GO
