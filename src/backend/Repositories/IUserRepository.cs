using HostingPlatform.API.Models;

namespace HostingPlatform.API.Repositories
{
    public interface IUserRepository
    {
        Task<List<User>> GetAllUsersAsync();
        Task<User> GetUserByIdAsync(int userId);
        Task<User> UpdateUserAsync(int userId, string email, string firstName, string lastName);
        Task<List<Role>> GetUserRolesAsync(int userId);
        Task AssignRoleToUserAsync(int userId, int roleId);
        Task RemoveRoleFromUserAsync(int userId, int roleId);
        Task<List<Role>> GetAllRolesAsync();
    }
}
