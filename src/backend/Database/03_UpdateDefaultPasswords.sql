-- =============================================
-- Update Default User Passwords
-- =============================================
-- This script updates the default user passwords with properly hashed values
-- You need to generate these hashes using the .NET application
-- Run this after getting the proper password hashes

-- To generate password hashes:
-- 1. Create a simple console app or use the API to hash passwords
-- 2. Use the PasswordHasher<string> class from Microsoft.AspNetCore.Identity
-- 3. Replace the hashes below with the generated values

-- Example C# code to generate hashes:
/*
using Microsoft.AspNetCore.Identity;

var hasher = new PasswordHasher<string>();
var adminHash = hasher.HashPassword(null, "Admin123!");
var userHash = hasher.HashPassword(null, "User123!");

Console.WriteLine($"Admin Hash: {adminHash}");
Console.WriteLine($"User Hash: {userHash}");
*/

-- For now, these are placeholder hashes
-- The actual hashing will be done by the API when you first register users
-- or you can update these with real hashes later

-- Note: Default users are already created in 01_CreateTables.sql
-- This script is for reference if you need to reset passwords

-- UPDATE Users 
-- SET PasswordHash = 'GENERATED_ADMIN_HASH_HERE'
-- WHERE Username = 'admin';

-- UPDATE Users 
-- SET PasswordHash = 'GENERATED_USER_HASH_HERE'
-- WHERE Username = 'user';
