-- =============================================
-- FIX SCRIPT #1: Missing Authentication Stored Procedures
-- Issue: AUTH-001
-- Description: Creates 5 missing stored procedures required by AuthRepository
-- =============================================

USE HostingPlatformDB;
GO

-- =============================================
-- SP: Get User By Username
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetUserByUsername')
    DROP PROCEDURE sp_GetUserByUsername;
GO

CREATE PROCEDURE sp_GetUserByUsername
    @Username NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        UserId,
        Username,
        Email,
        PasswordHash,
        FirstName,
        LastName,
        IsActive,
        CreatedDate,
        LastLoginDate,
        ModifiedDate
    FROM Users
    WHERE Username = @Username;
END
GO

-- =============================================
-- SP: Get User By Email
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetUserByEmail')
    DROP PROCEDURE sp_GetUserByEmail;
GO

CREATE PROCEDURE sp_GetUserByEmail
    @Email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        UserId,
        Username,
        Email,
        PasswordHash,
        FirstName,
        LastName,
        IsActive,
        CreatedDate,
        LastLoginDate,
        ModifiedDate
    FROM Users
    WHERE Email = @Email;
END
GO

-- =============================================
-- SP: Get User By ID
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetUserById')
    DROP PROCEDURE sp_GetUserById;
GO

CREATE PROCEDURE sp_GetUserById
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        UserId,
        Username,
        Email,
        PasswordHash,
        FirstName,
        LastName,
        IsActive,
        CreatedDate,
        LastLoginDate,
        ModifiedDate
    FROM Users
    WHERE UserId = @UserId;
END
GO

-- =============================================
-- SP: Get User Roles
-- NOTE: Returns single Role as array format for compatibility
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetUserRoles')
    DROP PROCEDURE sp_GetUserRoles;
GO

CREATE PROCEDURE sp_GetUserRoles
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Return the single Role column as RoleName for compatibility
    -- This allows the code to work with the current single-role architecture
    SELECT 
        1 AS RoleId,
        Role AS RoleName,
        CASE 
            WHEN Role = 'Admin' THEN 'Administrator with full access'
            WHEN Role = 'User' THEN 'Regular user with limited access'
            ELSE 'Standard user'
        END AS Description,
        CreatedDate,
        CAST(1 AS BIT) AS IsActive
    FROM Users
    WHERE UserId = @UserId;
END
GO

-- =============================================
-- SP: Update Last Login
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateLastLogin')
    DROP PROCEDURE sp_UpdateLastLogin;
GO

CREATE PROCEDURE sp_UpdateLastLogin
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Users
    SET LastLoginDate = GETUTCDATE()
    WHERE UserId = @UserId;
    
    RETURN 0;
END
GO

PRINT '✅ FIX #1 COMPLETE: Created 5 missing authentication stored procedures';
PRINT '   - sp_GetUserByUsername';
PRINT '   - sp_GetUserByEmail';
PRINT '   - sp_GetUserById';
PRINT '   - sp_GetUserRoles';
PRINT '   - sp_UpdateLastLogin';
GO
