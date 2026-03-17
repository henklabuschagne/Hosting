using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HostingPlatform.API.DTOs.Users;
using HostingPlatform.API.DTOs.Roles;
using HostingPlatform.API.Repositories;

namespace HostingPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public UsersController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _userRepository.GetAllUsersAsync();
                
                var userDtos = users.Select(u => new UserDto
                {
                    UserId = u.UserId,
                    Username = u.Username,
                    Email = u.Email,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    IsActive = u.IsActive,
                    CreatedDate = u.CreatedDate,
                    LastLoginDate = u.LastLoginDate,
                    Roles = new List<string>() // Will be populated from roles query
                }).ToList();

                // Get roles for each user
                foreach (var userDto in userDtos)
                {
                    var roles = await _userRepository.GetUserRolesAsync(userDto.UserId);
                    userDto.Roles = roles.Select(r => r.RoleName).ToList();
                }

                return Ok(userDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching users", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            try
            {
                var user = await _userRepository.GetUserByIdAsync(id);
                
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                var roles = await _userRepository.GetUserRolesAsync(user.UserId);

                var userDto = new UserDto
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    IsActive = user.IsActive,
                    CreatedDate = user.CreatedDate,
                    LastLoginDate = user.LastLoginDate,
                    Roles = roles.Select(r => r.RoleName).ToList()
                };

                return Ok(userDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching user", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto request)
        {
            try
            {
                var user = await _userRepository.UpdateUserAsync(id, request.Email, request.FirstName, request.LastName);
                
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                var roles = await _userRepository.GetUserRolesAsync(user.UserId);

                var userDto = new UserDto
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    IsActive = user.IsActive,
                    CreatedDate = user.CreatedDate,
                    LastLoginDate = user.LastLoginDate,
                    Roles = roles.Select(r => r.RoleName).ToList()
                };

                return Ok(userDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating user", error = ex.Message });
            }
        }

        [HttpPost("{userId}/roles/{roleId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignRole(int userId, int roleId)
        {
            try
            {
                await _userRepository.AssignRoleToUserAsync(userId, roleId);
                return Ok(new { message = "Role assigned successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while assigning role", error = ex.Message });
            }
        }

        [HttpDelete("{userId}/roles/{roleId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RemoveRole(int userId, int roleId)
        {
            try
            {
                await _userRepository.RemoveRoleFromUserAsync(userId, roleId);
                return Ok(new { message = "Role removed successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while removing role", error = ex.Message });
            }
        }

        [HttpGet("roles")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllRoles()
        {
            try
            {
                var roles = await _userRepository.GetAllRolesAsync();
                
                var roleDtos = roles.Select(r => new RoleDto
                {
                    RoleId = r.RoleId,
                    RoleName = r.RoleName,
                    Description = r.Description,
                    CreatedDate = r.CreatedDate,
                    IsActive = r.IsActive
                }).ToList();

                return Ok(roleDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching roles", error = ex.Message });
            }
        }
    }
}
