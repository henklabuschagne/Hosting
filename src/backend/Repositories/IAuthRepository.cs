using HostingPlatform.API.Models;

namespace HostingPlatform.API.Repositories
{
    public interface IAuthRepository
    {
        Task<User> GetUserByUsernameAsync(string username);
        Task<User> GetUserByEmailAsync(string email);
        Task<User> GetUserByIdAsync(int userId);
        Task<List<Role>> GetUserRolesAsync(int userId);
        Task<User> CreateUserAsync(string username, string email, string passwordHash, string firstName, string lastName);
        Task UpdateLastLoginAsync(int userId);
    }
}
