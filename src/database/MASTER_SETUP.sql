-- =============================================
-- HOSTING PLATFORM MANAGEMENT SYSTEM
-- MASTER DATABASE SETUP SCRIPT
-- =============================================
-- This script creates the complete database from scratch
-- Execute this script to initialize the database for the first time
-- =============================================

-- EXECUTION ORDER:
-- 1. Create Database
-- 2. Create Tables
-- 3. Insert Seed Data
-- 4. Create Stored Procedures (Auth, Clients, Servers, Tiers, Requests, Analytics)
-- =============================================

PRINT '========================================';
PRINT 'STARTING DATABASE INITIALIZATION';
PRINT '========================================';
GO

-- =============================================
-- STEP 1: CREATE DATABASE
-- =============================================
PRINT 'Step 1: Creating Database...';
GO

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'HostingPlatformDB')
BEGIN
    CREATE DATABASE HostingPlatformDB;
    PRINT 'Database HostingPlatformDB created successfully.';
END
ELSE
BEGIN
    PRINT 'Database HostingPlatformDB already exists.';
END
GO

USE HostingPlatformDB;
GO

-- =============================================
-- STEP 2: CREATE TABLES
-- =============================================
PRINT 'Step 2: Creating Tables...';
GO

-- Execute table creation script
:r 01_CreateTables.sql

PRINT 'Tables created successfully.';
GO

-- =============================================
-- STEP 3: INSERT SEED DATA
-- =============================================
PRINT 'Step 3: Inserting Seed Data...';
GO

-- Execute seed data script
:r 02_SeedData.sql

PRINT 'Seed data inserted successfully.';
GO

-- =============================================
-- STEP 4: CREATE STORED PROCEDURES
-- =============================================
PRINT 'Step 4: Creating Stored Procedures...';
GO

-- Auth Stored Procedures
PRINT '  - Creating Auth Stored Procedures...';
:r 03_StoredProcedures_Auth.sql
GO

-- Client Stored Procedures
PRINT '  - Creating Client Stored Procedures...';
:r 04_StoredProcedures_Clients.sql
GO

-- Server Stored Procedures
PRINT '  - Creating Server Stored Procedures...';
:r 05_StoredProcedures_Servers.sql
GO

-- Tier Stored Procedures
PRINT '  - Creating Tier Stored Procedures...';
:r 06_StoredProcedures_Tiers.sql
GO

-- Request Stored Procedures
PRINT '  - Creating Request Stored Procedures...';
:r 07_StoredProcedures_Requests.sql
GO

-- Analytics Stored Procedures
PRINT '  - Creating Analytics Stored Procedures...';
:r 08_StoredProcedures_Analytics.sql
GO

PRINT 'Stored procedures created successfully.';
GO

-- =============================================
-- STEP 5: VERIFY SETUP
-- =============================================
PRINT 'Step 5: Verifying Setup...';
GO

-- Execute verification script
:r 00_VerifySetup.sql

-- =============================================
-- SETUP COMPLETE
-- =============================================
PRINT '========================================';
PRINT 'DATABASE INITIALIZATION COMPLETE!';
PRINT '========================================';
PRINT '';
PRINT 'Next Steps:';
PRINT '1. Update backend appsettings.json with connection string';
PRINT '2. Default admin credentials:';
PRINT '   Username: admin';
PRINT '   Password: Admin123!';
PRINT '3. Start the backend API (dotnet run)';
PRINT '4. Start the frontend (npm run dev)';
PRINT '';
PRINT 'IMPORTANT: Change default passwords immediately!';
PRINT '========================================';
GO
