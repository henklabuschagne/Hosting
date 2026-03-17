-- =============================================
-- FIX SCRIPT #3: Update sp_CreateUser to Support FirstName/LastName
-- Issue: AUTH-005, AUTH-006
-- Description: Updates sp_CreateUser to accept and save FirstName/LastName
-- =============================================

USE HostingPlatformDB;
GO

-- =============================================
-- Drop existing sp_CreateUser
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_CreateUser')
    DROP PROCEDURE sp_CreateUser;
GO

-- =============================================
-- Create Updated sp_CreateUser
-- =============================================
CREATE PROCEDURE sp_CreateUser
    @Username NVARCHAR(100),
    @Email NVARCHAR(255),
    @PasswordHash NVARCHAR(255),
    @FirstName NVARCHAR(100) = NULL,
    @LastName NVARCHAR(100) = NULL,
    @Role NVARCHAR(50) = 'User',  -- Default to 'User' role if not specified
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
        
        -- Check if email already exists
        IF EXISTS (SELECT 1 FROM Users WHERE Email = @Email)
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR('Email already exists', 16, 1);
            RETURN 1;
        END
        
        -- Validate role
        IF @Role NOT IN ('Admin', 'User')
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR('Invalid role. Must be Admin or User', 16, 1);
            RETURN 1;
        END
        
        -- Insert new user with all fields
        INSERT INTO Users (
            Username, 
            Email, 
            PasswordHash, 
            FirstName, 
            LastName,
            Role,
            CreatedDate,
            ModifiedDate,
            IsActive
        )
        VALUES (
            @Username, 
            @Email, 
            @PasswordHash, 
            @FirstName, 
            @LastName,
            @Role,
            GETUTCDATE(),
            GETUTCDATE(),
            1
        );
        
        DECLARE @NewUserId INT = SCOPE_IDENTITY();
        
        -- Log audit (if AuditLog table exists)
        IF OBJECT_ID('AuditLog', 'U') IS NOT NULL
        BEGIN
            INSERT INTO AuditLog (UserId, Action, EntityType, EntityId, NewValues)
            VALUES (
                @CreatedBy, 
                'CREATE', 
                'User', 
                @NewUserId, 
                CONCAT('Username: ', @Username, ', Role: ', @Role, ', Name: ', @FirstName, ' ', @LastName)
            );
        END
        
        -- Return new user using sp_GetUserById
        EXEC sp_GetUserById @NewUserId;
        
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

PRINT '✅ FIX #3 COMPLETE: sp_CreateUser updated';
PRINT '   - Added @FirstName parameter';
PRINT '   - Added @LastName parameter';
PRINT '   - @Email parameter added';
PRINT '   - @Role parameter made optional (defaults to User)';
PRINT '   - Email uniqueness validation added';
PRINT '   - Returns complete user data via sp_GetUserById';
GO
