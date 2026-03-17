-- =============================================
-- Authentication Stored Procedures
-- =============================================

USE HostingPlatformDB;
GO

-- =============================================
-- SP: User Login
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UserLogin')
    DROP PROCEDURE sp_UserLogin;
GO

CREATE PROCEDURE sp_UserLogin
    @Username NVARCHAR(100),
    @PasswordHash NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserId INT;
    DECLARE @Role NVARCHAR(50);
    
    -- Validate user credentials
    SELECT 
        @UserId = UserId,
        @Role = Role
    FROM Users
    WHERE Username = @Username 
        AND PasswordHash = @PasswordHash
        AND IsActive = 1;
    
    IF @UserId IS NOT NULL
    BEGIN
        -- Update last login date
        UPDATE Users
        SET LastLoginDate = GETUTCDATE()
        WHERE UserId = @UserId;
        
        -- Return user info
        SELECT 
            UserId,
            Username,
            Role,
            Email,
            CreatedDate,
            LastLoginDate
        FROM Users
        WHERE UserId = @UserId;
        
        RETURN 0; -- Success
    END
    ELSE
    BEGIN
        RETURN 1; -- Invalid credentials
    END
END
GO

-- =============================================
-- SP: Create User
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_CreateUser')
    DROP PROCEDURE sp_CreateUser;
GO

CREATE PROCEDURE sp_CreateUser
    @Username NVARCHAR(100),
    @PasswordHash NVARCHAR(255),
    @Role NVARCHAR(50),
    @Email NVARCHAR(255) = NULL,
    @CreatedBy INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Check if username already exists
        IF EXISTS (SELECT 1 FROM Users WHERE Username = @Username)
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR('Username already exists', 16, 1);
            RETURN 1;
        END
        
        -- Insert new user
        INSERT INTO Users (Username, PasswordHash, Role, Email)
        VALUES (@Username, @PasswordHash, @Role, @Email);
        
        DECLARE @NewUserId INT = SCOPE_IDENTITY();
        
        -- Log audit
        INSERT INTO AuditLog (UserId, Action, EntityType, EntityId, NewValues)
        VALUES (@CreatedBy, 'CREATE', 'User', @NewUserId, 
                CONCAT('Username: ', @Username, ', Role: ', @Role));
        
        -- Return new user
        SELECT 
            UserId,
            Username,
            Role,
            Email,
            CreatedDate,
            IsActive
        FROM Users
        WHERE UserId = @NewUserId;
        
        COMMIT TRANSACTION;
        RETURN 0;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
        RETURN 1;
    END CATCH
END
GO

-- =============================================
-- SP: Get All Users (Admin only)
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetAllUsers')
    DROP PROCEDURE sp_GetAllUsers;
GO

CREATE PROCEDURE sp_GetAllUsers
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        UserId,
        Username,
        Role,
        Email,
        CreatedDate,
        LastLoginDate,
        IsActive
    FROM Users
    ORDER BY CreatedDate DESC;
END
GO

PRINT 'Authentication stored procedures created successfully!';
GO
