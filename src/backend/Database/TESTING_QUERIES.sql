-- =============================================
-- TESTING QUERIES FOR PHASE 1
-- =============================================
-- Use these queries to verify the database setup
-- and test the stored procedures

USE HostingPlatformDB;
GO

-- =============================================
-- 1. VERIFY TABLES EXIST
-- =============================================
SELECT 
    TABLE_NAME,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
-- Expected: Roles, UserRoles, Users

-- =============================================
-- 2. VERIFY STORED PROCEDURES EXIST
-- =============================================
SELECT 
    ROUTINE_NAME,
    ROUTINE_TYPE
FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_TYPE = 'PROCEDURE'
ORDER BY ROUTINE_NAME;
-- Expected: 11 stored procedures starting with sp_

-- =============================================
-- 3. VIEW ALL ROLES
-- =============================================
SELECT * FROM Roles;
-- Expected: 2 roles (Admin, User)

-- =============================================
-- 4. VIEW ALL USERS
-- =============================================
SELECT 
    UserId,
    Username,
    Email,
    FirstName,
    LastName,
    IsActive,
    CreatedDate,
    LastLoginDate
FROM Users;
-- Expected: 2 users (admin, user)

-- =============================================
-- 5. VIEW USER-ROLE ASSIGNMENTS
-- =============================================
SELECT 
    u.Username,
    r.RoleName,
    ur.AssignedDate
FROM UserRoles ur
INNER JOIN Users u ON ur.UserId = u.UserId
INNER JOIN Roles r ON ur.RoleId = r.RoleId;
-- Expected: admin with Admin role, user with User role

-- =============================================
-- 6. TEST sp_GetUserByUsername
-- =============================================
EXEC sp_GetUserByUsername @Username = 'admin';
-- Expected: Admin user details

EXEC sp_GetUserByUsername @Username = 'user';
-- Expected: Regular user details

-- =============================================
-- 7. TEST sp_GetUserRoles
-- =============================================
DECLARE @AdminUserId INT;
SELECT @AdminUserId = UserId FROM Users WHERE Username = 'admin';
EXEC sp_GetUserRoles @UserId = @AdminUserId;
-- Expected: Admin role

DECLARE @RegularUserId INT;
SELECT @RegularUserId = UserId FROM Users WHERE Username = 'user';
EXEC sp_GetUserRoles @UserId = @RegularUserId;
-- Expected: User role

-- =============================================
-- 8. TEST sp_AuthenticateUser
-- =============================================
EXEC sp_AuthenticateUser @Username = 'admin';
-- Expected: Two result sets - user details and roles

-- =============================================
-- 9. TEST sp_GetAllUsers
-- =============================================
EXEC sp_GetAllUsers;
-- Expected: All users with their roles concatenated

-- =============================================
-- 10. TEST sp_GetAllRoles
-- =============================================
EXEC sp_GetAllRoles;
-- Expected: All active roles

-- =============================================
-- 11. TEST USER CREATION
-- =============================================
-- Create a test user
EXEC sp_CreateUser 
    @Username = 'testuser',
    @Email = 'test@example.com',
    @PasswordHash = 'TestHashValue',
    @FirstName = 'Test',
    @LastName = 'User';
-- Expected: New user created with User role

-- Verify the new user
SELECT * FROM Users WHERE Username = 'testuser';
EXEC sp_GetUserRoles @UserId = (SELECT UserId FROM Users WHERE Username = 'testuser');

-- Clean up test user (optional)
-- DELETE FROM Users WHERE Username = 'testuser';

-- =============================================
-- 12. TEST USER UPDATE
-- =============================================
DECLARE @TestUserId INT;
SELECT @TestUserId = UserId FROM Users WHERE Username = 'testuser';

EXEC sp_UpdateUser
    @UserId = @TestUserId,
    @Email = 'newemail@example.com',
    @FirstName = 'UpdatedTest',
    @LastName = 'UpdatedUser';
-- Expected: User details updated

-- =============================================
-- 13. TEST ROLE ASSIGNMENT
-- =============================================
DECLARE @UserToUpdate INT, @AdminRoleId INT;
SELECT @UserToUpdate = UserId FROM Users WHERE Username = 'testuser';
SELECT @AdminRoleId = RoleId FROM Roles WHERE RoleName = 'Admin';

EXEC sp_AssignRoleToUser 
    @UserId = @UserToUpdate,
    @RoleId = @AdminRoleId;
-- Expected: Admin role assigned to test user

-- Verify
EXEC sp_GetUserRoles @UserId = @UserToUpdate;
-- Expected: Both User and Admin roles

-- =============================================
-- 14. TEST ROLE REMOVAL
-- =============================================
DECLARE @UserToUpdate2 INT, @AdminRoleId2 INT;
SELECT @UserToUpdate2 = UserId FROM Users WHERE Username = 'testuser';
SELECT @AdminRoleId2 = RoleId FROM Roles WHERE RoleName = 'Admin';

EXEC sp_RemoveRoleFromUser 
    @UserId = @UserToUpdate2,
    @RoleId = @AdminRoleId2;
-- Expected: Admin role removed from test user

-- Verify
EXEC sp_GetUserRoles @UserId = @UserToUpdate2;
-- Expected: Only User role

-- =============================================
-- 15. TEST LAST LOGIN UPDATE
-- =============================================
DECLARE @AdminId INT;
SELECT @AdminId = UserId FROM Users WHERE Username = 'admin';

SELECT LastLoginDate FROM Users WHERE UserId = @AdminId;
-- Note the current LastLoginDate

EXEC sp_UpdateLastLoginDate @UserId = @AdminId;

SELECT LastLoginDate FROM Users WHERE UserId = @AdminId;
-- Expected: LastLoginDate updated to current UTC time

-- =============================================
-- 16. VERIFY DATA INTEGRITY
-- =============================================
-- Check for orphaned UserRoles (should return 0)
SELECT COUNT(*) AS OrphanedUserRoles
FROM UserRoles ur
LEFT JOIN Users u ON ur.UserId = u.UserId
LEFT JOIN Roles r ON ur.RoleId = r.RoleId
WHERE u.UserId IS NULL OR r.RoleId IS NULL;

-- Check for users without roles (should return 0)
SELECT u.Username
FROM Users u
LEFT JOIN UserRoles ur ON u.UserId = ur.UserId
WHERE ur.UserRoleId IS NULL;

-- =============================================
-- 17. PERFORMANCE CHECK
-- =============================================
-- Check index usage
SELECT 
    i.name AS IndexName,
    OBJECT_NAME(i.object_id) AS TableName,
    i.type_desc AS IndexType
FROM sys.indexes i
WHERE OBJECT_NAME(i.object_id) IN ('Users', 'Roles', 'UserRoles')
AND i.name IS NOT NULL
ORDER BY TableName, IndexName;

-- =============================================
-- 18. CLEANUP TEST DATA (OPTIONAL)
-- =============================================
-- Uncomment to remove test user
-- DELETE FROM Users WHERE Username = 'testuser';

-- =============================================
-- 19. RESET DEFAULT USER PASSWORDS
-- =============================================
-- Use this to manually update password hashes
-- Replace 'YOUR_HASH_HERE' with actual hash from PasswordHashGenerator

-- UPDATE Users 
-- SET PasswordHash = 'YOUR_ADMIN_HASH_HERE'
-- WHERE Username = 'admin';

-- UPDATE Users 
-- SET PasswordHash = 'YOUR_USER_HASH_HERE'
-- WHERE Username = 'user';

-- =============================================
-- 20. BACKUP QUERIES (PRODUCTION)
-- =============================================
-- Backup all users and roles before making changes
/*
SELECT * INTO Users_Backup FROM Users;
SELECT * INTO Roles_Backup FROM Roles;
SELECT * INTO UserRoles_Backup FROM UserRoles;

-- Restore from backup if needed
-- DELETE FROM UserRoles;
-- DELETE FROM Users;
-- DELETE FROM Roles;
-- INSERT INTO Users SELECT * FROM Users_Backup;
-- INSERT INTO Roles SELECT * FROM Roles_Backup;
-- INSERT INTO UserRoles SELECT * FROM UserRoles_Backup;
*/
