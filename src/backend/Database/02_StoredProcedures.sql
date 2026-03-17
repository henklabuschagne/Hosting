-- =============================================
-- Phase 1: Stored Procedures for Authentication
-- =============================================

-- =============================================
-- SP: Get User By Username
-- =============================================
CREATE PROCEDURE sp_GetUserByUsername
    @Username NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        u.UserId,
        u.Username,
        u.Email,
        u.PasswordHash,
        u.FirstName,
        u.LastName,
        u.IsActive,
        u.CreatedDate,
        u.LastLoginDate,
        u.ModifiedDate
    FROM Users u
    WHERE u.Username = @Username AND u.IsActive = 1;
END
GO

-- =============================================
-- SP: Get User By Email
-- =============================================
CREATE PROCEDURE sp_GetUserByEmail
    @Email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        u.UserId,
        u.Username,
        u.Email,
        u.PasswordHash,
        u.FirstName,
        u.LastName,
        u.IsActive,
        u.CreatedDate,
        u.LastLoginDate,
        u.ModifiedDate
    FROM Users u
    WHERE u.Email = @Email AND u.IsActive = 1;
END
GO

-- =============================================
-- SP: Get User By ID
-- =============================================
CREATE PROCEDURE sp_GetUserById
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        u.UserId,
        u.Username,
        u.Email,
        u.PasswordHash,
        u.FirstName,
        u.LastName,
        u.IsActive,
        u.CreatedDate,
        u.LastLoginDate,
        u.ModifiedDate
    FROM Users u
    WHERE u.UserId = @UserId;
END
GO

-- =============================================
-- SP: Get User Roles
-- =============================================
CREATE PROCEDURE sp_GetUserRoles
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        r.RoleId,
        r.RoleName,
        r.Description,
        ur.AssignedDate
    FROM UserRoles ur
    INNER JOIN Roles r ON ur.RoleId = r.RoleId
    WHERE ur.UserId = @UserId AND r.IsActive = 1;
END
GO

-- =============================================
-- SP: Authenticate User
-- =============================================
CREATE PROCEDURE sp_AuthenticateUser
    @Username NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        u.UserId,
        u.Username,
        u.Email,
        u.PasswordHash,
        u.FirstName,
        u.LastName,
        u.IsActive,
        u.CreatedDate,
        u.LastLoginDate,
        u.ModifiedDate
    FROM Users u
    WHERE u.Username = @Username AND u.IsActive = 1;
    
    -- Get user roles
    IF @@ROWCOUNT > 0
    BEGIN
        SELECT 
            r.RoleId,
            r.RoleName,
            r.Description
        FROM UserRoles ur
        INNER JOIN Roles r ON ur.RoleId = r.RoleId
        INNER JOIN Users u ON ur.UserId = u.UserId
        WHERE u.Username = @Username AND r.IsActive = 1;
    END
END
GO

-- =============================================
-- SP: Update Last Login Date
-- =============================================
CREATE PROCEDURE sp_UpdateLastLoginDate
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Users
    SET LastLoginDate = GETUTCDATE()
    WHERE UserId = @UserId;
END
GO

-- =============================================
-- SP: Create User
-- =============================================
CREATE PROCEDURE sp_CreateUser
    @Username NVARCHAR(100),
    @Email NVARCHAR(255),
    @PasswordHash NVARCHAR(255),
    @FirstName NVARCHAR(100),
    @LastName NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserId INT;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Insert User
        INSERT INTO Users (Username, Email, PasswordHash, FirstName, LastName)
        VALUES (@Username, @Email, @PasswordHash, @FirstName, @LastName);
        
        SET @UserId = SCOPE_IDENTITY();
        
        -- Assign default 'User' role
        INSERT INTO UserRoles (UserId, RoleId)
        SELECT @UserId, RoleId FROM Roles WHERE RoleName = 'User';
        
        COMMIT TRANSACTION;
        
        -- Return created user
        EXEC sp_GetUserById @UserId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- =============================================
-- SP: Update User
-- =============================================
CREATE PROCEDURE sp_UpdateUser
    @UserId INT,
    @Email NVARCHAR(255),
    @FirstName NVARCHAR(100),
    @LastName NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Users
    SET 
        Email = @Email,
        FirstName = @FirstName,
        LastName = @LastName,
        ModifiedDate = GETUTCDATE()
    WHERE UserId = @UserId;
    
    -- Return updated user
    EXEC sp_GetUserById @UserId;
END
GO

-- =============================================
-- SP: Get All Users
-- =============================================
CREATE PROCEDURE sp_GetAllUsers
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        u.UserId,
        u.Username,
        u.Email,
        u.FirstName,
        u.LastName,
        u.IsActive,
        u.CreatedDate,
        u.LastLoginDate,
        u.ModifiedDate,
        STRING_AGG(r.RoleName, ', ') AS Roles
    FROM Users u
    LEFT JOIN UserRoles ur ON u.UserId = ur.UserId
    LEFT JOIN Roles r ON ur.RoleId = r.RoleId
    GROUP BY u.UserId, u.Username, u.Email, u.FirstName, u.LastName, 
             u.IsActive, u.CreatedDate, u.LastLoginDate, u.ModifiedDate
    ORDER BY u.CreatedDate DESC;
END
GO

-- =============================================
-- SP: Assign Role to User
-- =============================================
CREATE PROCEDURE sp_AssignRoleToUser
    @UserId INT,
    @RoleId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF NOT EXISTS (SELECT 1 FROM UserRoles WHERE UserId = @UserId AND RoleId = @RoleId)
    BEGIN
        INSERT INTO UserRoles (UserId, RoleId)
        VALUES (@UserId, @RoleId);
    END
END
GO

-- =============================================
-- SP: Remove Role from User
-- =============================================
CREATE PROCEDURE sp_RemoveRoleFromUser
    @UserId INT,
    @RoleId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DELETE FROM UserRoles
    WHERE UserId = @UserId AND RoleId = @RoleId;
END
GO

-- =============================================
-- SP: Get All Roles
-- =============================================
CREATE PROCEDURE sp_GetAllRoles
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        RoleId,
        RoleName,
        Description,
        CreatedDate,
        IsActive
    FROM Roles
    WHERE IsActive = 1
    ORDER BY RoleName;
END
GO
