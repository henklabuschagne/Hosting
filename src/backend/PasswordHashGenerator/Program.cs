using Microsoft.AspNetCore.Identity;

Console.WriteLine("Password Hash Generator");
Console.WriteLine("======================\n");

var hasher = new PasswordHasher<string>();

// Generate hash for Admin password
var adminPassword = "Admin123!";
var adminHash = hasher.HashPassword(null, adminPassword);
Console.WriteLine($"Admin Password: {adminPassword}");
Console.WriteLine($"Admin Hash: {adminHash}\n");

// Generate hash for User password
var userPassword = "User123!";
var userHash = hasher.HashPassword(null, userPassword);
Console.WriteLine($"User Password: {userPassword}");
Console.WriteLine($"User Hash: {userHash}\n");

// Generate SQL Update Script
Console.WriteLine("SQL Update Script:");
Console.WriteLine("==================");
Console.WriteLine($"UPDATE Users SET PasswordHash = '{adminHash}' WHERE Username = 'admin';");
Console.WriteLine($"UPDATE Users SET PasswordHash = '{userHash}' WHERE Username = 'user';");
Console.WriteLine();

Console.WriteLine("Copy the SQL commands above and run them in your database.");
Console.WriteLine("\nPress any key to exit...");
Console.ReadKey();
