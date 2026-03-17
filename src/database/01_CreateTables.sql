-- =============================================
-- Hosting Platform Management System
-- Database Schema Creation Script
-- =============================================

USE master;
GO

-- Create Database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'HostingPlatformDB')
BEGIN
    CREATE DATABASE HostingPlatformDB;
END
GO

USE HostingPlatformDB;
GO

-- =============================================
-- Table: Users
-- Stores user authentication and role information
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        UserId INT IDENTITY(1,1) PRIMARY KEY,
        Username NVARCHAR(100) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(255) NOT NULL,
        Role NVARCHAR(50) NOT NULL CHECK (Role IN ('Admin', 'User')),
        Email NVARCHAR(255) NULL,
        CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        LastLoginDate DATETIME2 NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CONSTRAINT CK_Users_Role CHECK (Role IN ('Admin', 'User'))
    );

    CREATE INDEX IX_Users_Username ON Users(Username);
    CREATE INDEX IX_Users_Role ON Users(Role);
END
GO

-- =============================================
-- Table: ServerTiers
-- Stores tier configurations (Small, Medium, Large)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ServerTiers')
BEGIN
    CREATE TABLE ServerTiers (
        TierId INT IDENTITY(1,1) PRIMARY KEY,
        TierName NVARCHAR(50) NOT NULL UNIQUE,
        DisplayName NVARCHAR(100) NOT NULL,
        MaxEntities INT NOT NULL,
        MaxTemplates INT NOT NULL,
        MaxUsers INT NOT NULL,
        PricePerMonth DECIMAL(10,2) NOT NULL,
        Description NVARCHAR(500) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        ModifiedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT CK_ServerTiers_MaxValues CHECK (MaxEntities > 0 AND MaxTemplates > 0 AND MaxUsers > 0),
        CONSTRAINT CK_ServerTiers_Price CHECK (PricePerMonth >= 0)
    );

    CREATE INDEX IX_ServerTiers_TierName ON ServerTiers(TierName);
    CREATE INDEX IX_ServerTiers_IsActive ON ServerTiers(IsActive);
END
GO

-- =============================================
-- Table: Servers
-- Stores physical/virtual server information
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Servers')
BEGIN
    CREATE TABLE Servers (
        ServerId INT IDENTITY(1,1) PRIMARY KEY,
        ServerName NVARCHAR(200) NOT NULL,
        ServerType NVARCHAR(50) NOT NULL CHECK (ServerType IN ('Application', 'Database')),
        TierId INT NOT NULL,
        MaxEntities INT NOT NULL,
        MaxTemplates INT NOT NULL,
        MaxUsers INT NOT NULL,
        IPAddress NVARCHAR(50) NULL,
        Location NVARCHAR(200) NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (Status IN ('Active', 'Maintenance', 'Offline')),
        Notes NVARCHAR(1000) NULL,
        CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        ModifiedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_Servers_ServerTiers FOREIGN KEY (TierId) REFERENCES ServerTiers(TierId),
        CONSTRAINT CK_Servers_MaxValues CHECK (MaxEntities > 0 AND MaxTemplates > 0 AND MaxUsers > 0)
    );

    CREATE INDEX IX_Servers_TierId ON Servers(TierId);
    CREATE INDEX IX_Servers_Status ON Servers(Status);
    CREATE INDEX IX_Servers_ServerType ON Servers(ServerType);
END
GO

-- =============================================
-- Table: Clients
-- Stores client/customer information
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Clients')
BEGIN
    CREATE TABLE Clients (
        ClientId INT IDENTITY(1,1) PRIMARY KEY,
        ClientName NVARCHAR(200) NOT NULL,
        TierId INT NOT NULL,
        HostingType NVARCHAR(50) NOT NULL CHECK (HostingType IN ('Dedicated', 'Shared')),
        CurrentEntities INT NOT NULL DEFAULT 0,
        CurrentTemplates INT NOT NULL DEFAULT 0,
        CurrentUsers INT NOT NULL DEFAULT 0,
        DiscussedMonthlyFee DECIMAL(10,2) NOT NULL,
        ActualMonthlyFee DECIMAL(10,2) NOT NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT 'active' CHECK (Status IN ('active', 'suspended', 'cancelled')),
        ContactEmail NVARCHAR(255) NULL,
        ContactPhone NVARCHAR(50) NULL,
        Notes NVARCHAR(1000) NULL,
        CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        ModifiedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_Clients_ServerTiers FOREIGN KEY (TierId) REFERENCES ServerTiers(TierId),
        CONSTRAINT CK_Clients_CurrentValues CHECK (CurrentEntities >= 0 AND CurrentTemplates >= 0 AND CurrentUsers >= 0),
        CONSTRAINT CK_Clients_Fees CHECK (DiscussedMonthlyFee >= 0 AND ActualMonthlyFee >= 0)
    );

    CREATE INDEX IX_Clients_TierId ON Clients(TierId);
    CREATE INDEX IX_Clients_Status ON Clients(Status);
    CREATE INDEX IX_Clients_HostingType ON Clients(HostingType);
    CREATE INDEX IX_Clients_ClientName ON Clients(ClientName);
END
GO

-- =============================================
-- Table: ClientServerAssignments
-- Maps clients to their servers (many-to-many)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ClientServerAssignments')
BEGIN
    CREATE TABLE ClientServerAssignments (
        AssignmentId INT IDENTITY(1,1) PRIMARY KEY,
        ClientId INT NOT NULL,
        ServerId INT NOT NULL,
        AssignedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        IsActive BIT NOT NULL DEFAULT 1,
        Notes NVARCHAR(500) NULL,
        CONSTRAINT FK_ClientServerAssignments_Clients FOREIGN KEY (ClientId) REFERENCES Clients(ClientId),
        CONSTRAINT FK_ClientServerAssignments_Servers FOREIGN KEY (ServerId) REFERENCES Servers(ServerId),
        CONSTRAINT UQ_ClientServerAssignments UNIQUE (ClientId, ServerId, IsActive)
    );

    CREATE INDEX IX_ClientServerAssignments_ClientId ON ClientServerAssignments(ClientId);
    CREATE INDEX IX_ClientServerAssignments_ServerId ON ClientServerAssignments(ServerId);
    CREATE INDEX IX_ClientServerAssignments_IsActive ON ClientServerAssignments(IsActive);
END
GO

-- =============================================
-- Table: ClientHostingHistory
-- Tracks historical changes to client hosting
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ClientHostingHistory')
BEGIN
    CREATE TABLE ClientHostingHistory (
        HistoryId INT IDENTITY(1,1) PRIMARY KEY,
        ClientId INT NOT NULL,
        TierId INT NOT NULL,
        ServerId INT NULL,
        HostingType NVARCHAR(50) NOT NULL,
        Entities INT NOT NULL,
        Templates INT NOT NULL,
        Users INT NOT NULL,
        MonthlyFee DECIMAL(10,2) NOT NULL,
        StartDate DATETIME2 NOT NULL,
        EndDate DATETIME2 NULL,
        ChangeReason NVARCHAR(500) NULL,
        ChangedBy INT NULL,
        CONSTRAINT FK_ClientHostingHistory_Clients FOREIGN KEY (ClientId) REFERENCES Clients(ClientId),
        CONSTRAINT FK_ClientHostingHistory_ServerTiers FOREIGN KEY (TierId) REFERENCES ServerTiers(TierId),
        CONSTRAINT FK_ClientHostingHistory_Servers FOREIGN KEY (ServerId) REFERENCES Servers(ServerId),
        CONSTRAINT FK_ClientHostingHistory_Users FOREIGN KEY (ChangedBy) REFERENCES Users(UserId)
    );

    CREATE INDEX IX_ClientHostingHistory_ClientId ON ClientHostingHistory(ClientId);
    CREATE INDEX IX_ClientHostingHistory_StartDate ON ClientHostingHistory(StartDate);
END
GO

-- =============================================
-- Table: TierRecommendationRequests
-- Stores customer tier recommendation requests
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TierRecommendationRequests')
BEGIN
    CREATE TABLE TierRecommendationRequests (
        RequestId INT IDENTITY(1,1) PRIMARY KEY,
        CustomerName NVARCHAR(200) NOT NULL,
        CustomerEmail NVARCHAR(255) NULL,
        RequestedEntities INT NOT NULL,
        RequestedTemplates INT NOT NULL,
        RequestedUsers INT NOT NULL,
        RecommendedTierId INT NULL,
        RecommendedTierName NVARCHAR(100) NULL,
        EstimatedMonthlyCost DECIMAL(10,2) NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (Status IN ('pending', 'reviewed', 'converted', 'declined')),
        RequestDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        ReviewedDate DATETIME2 NULL,
        ReviewedBy INT NULL,
        Notes NVARCHAR(1000) NULL,
        CONSTRAINT FK_TierRecommendationRequests_Tiers FOREIGN KEY (RecommendedTierId) REFERENCES ServerTiers(TierId),
        CONSTRAINT FK_TierRecommendationRequests_Users FOREIGN KEY (ReviewedBy) REFERENCES Users(UserId),
        CONSTRAINT CK_TierRequests_Values CHECK (RequestedEntities > 0 AND RequestedTemplates > 0 AND RequestedUsers > 0)
    );

    CREATE INDEX IX_TierRequests_Status ON TierRecommendationRequests(Status);
    CREATE INDEX IX_TierRequests_RequestDate ON TierRecommendationRequests(RequestDate);
END
GO

-- =============================================
-- Table: AuditLog
-- Tracks all system changes for compliance
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditLog')
BEGIN
    CREATE TABLE AuditLog (
        AuditId BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NULL,
        Action NVARCHAR(100) NOT NULL,
        EntityType NVARCHAR(100) NOT NULL,
        EntityId INT NULL,
        OldValues NVARCHAR(MAX) NULL,
        NewValues NVARCHAR(MAX) NULL,
        IPAddress NVARCHAR(50) NULL,
        Timestamp DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_AuditLog_Users FOREIGN KEY (UserId) REFERENCES Users(UserId)
    );

    CREATE INDEX IX_AuditLog_UserId ON AuditLog(UserId);
    CREATE INDEX IX_AuditLog_Timestamp ON AuditLog(Timestamp);
    CREATE INDEX IX_AuditLog_EntityType ON AuditLog(EntityType, EntityId);
END
GO

PRINT 'Database schema created successfully!';
GO
