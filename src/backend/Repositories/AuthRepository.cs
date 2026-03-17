using System.Data;
using Microsoft.Data.SqlClient;
using Dapper;
using HostingPlatform.API.Models;

namespace HostingPlatform.API.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly string _connectionString;

        public AuthRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        private IDbConnection CreateConnection()
        {
            return new SqlConnection(_connectionString);
        }

        public async Task<User> GetUserByUsernameAsync(string username)
        {
            using var connection = CreateConnection();
            var parameters = new { Username = username };
            
            var user = await connection.QueryFirstOrDefaultAsync<User>(
                "sp_GetUserByUsername",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return user;
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            using var connection = CreateConnection();
            var parameters = new { Email = email };
            
            var user = await connection.QueryFirstOrDefaultAsync<User>(
                "sp_GetUserByEmail",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return user;
        }

        public async Task<User> GetUserByIdAsync(int userId)
        {
            using var connection = CreateConnection();
            var parameters = new { UserId = userId };
            
            var user = await connection.QueryFirstOrDefaultAsync<User>(
                "sp_GetUserById",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return user;
        }

        public async Task<List<Role>> GetUserRolesAsync(int userId)
        {
            using var connection = CreateConnection();
            var parameters = new { UserId = userId };
            
            var roles = await connection.QueryAsync<Role>(
                "sp_GetUserRoles",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return roles.ToList();
        }

        public async Task<User> CreateUserAsync(string username, string email, string passwordHash, string firstName, string lastName)
        {
            using var connection = CreateConnection();
            var parameters = new
            {
                Username = username,
                Email = email,
                PasswordHash = passwordHash,
                FirstName = firstName,
                LastName = lastName
            };
            
            var user = await connection.QueryFirstOrDefaultAsync<User>(
                "sp_CreateUser",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return user;
        }

        public async Task UpdateLastLoginAsync(int userId)
        {
            using var connection = CreateConnection();
            var parameters = new { UserId = userId };
            
            await connection.ExecuteAsync(
                "sp_UpdateLastLoginDate",
                parameters,
                commandType: CommandType.StoredProcedure
            );
        }
    }
}
