-- =============================================
-- Phase 1: Authentication & Authorization
-- Tables: Users, Roles, UserRoles
-- =============================================

-- Create Roles Table
CREATE TABLE Roles (
    RoleId INT PRIMARY KEY IDENTITY(1,1),
    RoleName NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(255),
    CreatedDate DATETIME2 DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1
);

-- Create Users Table
CREATE TABLE Users (
    UserId INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(100) NOT NULL UNIQUE,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    FirstName NVARCHAR(100),
    LastName NVARCHAR(100),
    IsActive BIT DEFAULT 1,
    CreatedDate DATETIME2 DEFAULT GETUTCDATE(),
    LastLoginDate DATETIME2 NULL,
    ModifiedDate DATETIME2 DEFAULT GETUTCDATE()
);

-- Create UserRoles Junction Table
CREATE TABLE UserRoles (
    UserRoleId INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    RoleId INT NOT NULL,
    AssignedDate DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_UserRoles_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
    CONSTRAINT FK_UserRoles_Roles FOREIGN KEY (RoleId) REFERENCES Roles(RoleId) ON DELETE CASCADE,
    CONSTRAINT UQ_UserRoles UNIQUE (UserId, RoleId)
);

-- Create Indexes
CREATE INDEX IX_Users_Username ON Users(Username);
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_UserRoles_UserId ON UserRoles(UserId);
CREATE INDEX IX_UserRoles_RoleId ON UserRoles(RoleId);

-- Insert Default Roles
INSERT INTO Roles (RoleName, Description) VALUES 
('Admin', 'Administrator with full system access'),
('User', 'Regular user with limited access');

-- Insert Default Admin User (password: Admin123!)
-- Note: This is a placeholder hash - should be generated properly in production
INSERT INTO Users (Username, Email, PasswordHash, FirstName, LastName) VALUES 
('admin', 'admin@hostingplatform.com', 'AQAAAAEAACcQAAAAEDummyHashForDevelopment', 'System', 'Administrator'),
('user', 'user@hostingplatform.com', 'AQAAAAEAACcQAAAAEDummyHashForDevelopment', 'Regular', 'User');

-- Assign Roles to Default Users
INSERT INTO UserRoles (UserId, RoleId) VALUES 
((SELECT UserId FROM Users WHERE Username = 'admin'), (SELECT RoleId FROM Roles WHERE RoleName = 'Admin')),
((SELECT UserId FROM Users WHERE Username = 'user'), (SELECT RoleId FROM Roles WHERE RoleName = 'User'));
