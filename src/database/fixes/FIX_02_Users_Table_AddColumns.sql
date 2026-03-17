-- =============================================
-- FIX SCRIPT #2: Add Missing Columns to Users Table
-- Issue: AUTH-002
-- Description: Adds FirstName, LastName, and ModifiedDate columns
-- =============================================

USE HostingPlatformDB;
GO

-- =============================================
-- Add FirstName Column
-- =============================================
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Users') 
    AND name = 'FirstName'
)
BEGIN
    ALTER TABLE Users
    ADD FirstName NVARCHAR(100) NULL;
    
    PRINT '✅ Added FirstName column to Users table';
END
ELSE
BEGIN
    PRINT '⚠️  FirstName column already exists';
END
GO

-- =============================================
-- Add LastName Column
-- =============================================
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Users') 
    AND name = 'LastName'
)
BEGIN
    ALTER TABLE Users
    ADD LastName NVARCHAR(100) NULL;
    
    PRINT '✅ Added LastName column to Users table';
END
ELSE
BEGIN
    PRINT '⚠️  LastName column already exists';
END
GO

-- =============================================
-- Add ModifiedDate Column
-- =============================================
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Users') 
    AND name = 'ModifiedDate'
)
BEGIN
    ALTER TABLE Users
    ADD ModifiedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE();
    
    PRINT '✅ Added ModifiedDate column to Users table';
END
ELSE
BEGIN
    PRINT '⚠️  ModifiedDate column already exists';
END
GO

-- =============================================
-- Create Index on LastName for better query performance
-- =============================================
IF NOT EXISTS (
    SELECT * FROM sys.indexes 
    WHERE name = 'IX_Users_LastName' 
    AND object_id = OBJECT_ID('Users')
)
BEGIN
    CREATE INDEX IX_Users_LastName ON Users(LastName);
    PRINT '✅ Created index IX_Users_LastName';
END
GO

-- =============================================
-- Verify the changes
-- =============================================
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Users'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT '✅ FIX #2 COMPLETE: Users table schema updated';
PRINT '   - FirstName NVARCHAR(100) NULL';
PRINT '   - LastName NVARCHAR(100) NULL';
PRINT '   - ModifiedDate DATETIME2 NOT NULL';
GO
