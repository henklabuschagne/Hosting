using System.Data;
using Microsoft.Data.SqlClient;
using Dapper;
using HostingPlatform.API.Models;

namespace HostingPlatform.API.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly string _connectionString;

        public UserRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        private IDbConnection CreateConnection()
        {
            return new SqlConnection(_connectionString);
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            using var connection = CreateConnection();
            
            var users = await connection.QueryAsync<User>(
                "sp_GetAllUsers",
                commandType: CommandType.StoredProcedure
            );

            return users.ToList();
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

        public async Task<User> UpdateUserAsync(int userId, string email, string firstName, string lastName)
        {
            using var connection = CreateConnection();
            var parameters = new
            {
                UserId = userId,
                Email = email,
                FirstName = firstName,
                LastName = lastName
            };
            
            var user = await connection.QueryFirstOrDefaultAsync<User>(
                "sp_UpdateUser",
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

        public async Task AssignRoleToUserAsync(int userId, int roleId)
        {
            using var connection = CreateConnection();
            var parameters = new { UserId = userId, RoleId = roleId };
            
            await connection.ExecuteAsync(
                "sp_AssignRoleToUser",
                parameters,
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task RemoveRoleFromUserAsync(int userId, int roleId)
        {
            using var connection = CreateConnection();
            var parameters = new { UserId = userId, RoleId = roleId };
            
            await connection.ExecuteAsync(
                "sp_RemoveRoleFromUser",
                parameters,
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<List<Role>> GetAllRolesAsync()
        {
            using var connection = CreateConnection();
            
            var roles = await connection.QueryAsync<Role>(
                "sp_GetAllRoles",
                commandType: CommandType.StoredProcedure
            );

            return roles.ToList();
        }
    }
}
