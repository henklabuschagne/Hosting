using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using HostingPlatform.API.DTOs.Auth;
using HostingPlatform.API.Repositories;

namespace HostingPlatform.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly IConfiguration _configuration;
        private readonly PasswordHasher<string> _passwordHasher;

        public AuthService(IAuthRepository authRepository, IConfiguration configuration)
        {
            _authRepository = authRepository;
            _configuration = configuration;
            _passwordHasher = new PasswordHasher<string>();
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            var user = await _authRepository.GetUserByUsernameAsync(request.Username);
            
            if (user == null)
            {
                throw new UnauthorizedAccessException("Invalid username or password");
            }

            if (!VerifyPassword(request.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid username or password");
            }

            var roles = await _authRepository.GetUserRolesAsync(user.UserId);
            var roleNames = roles.Select(r => r.RoleName).ToList();

            await _authRepository.UpdateLastLoginAsync(user.UserId);

            var token = GenerateJwtToken(user.UserId, user.Username, roleNames);

            return new LoginResponseDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Roles = roleNames,
                Token = token
            };
        }

        public async Task<LoginResponseDto> RegisterAsync(RegisterRequestDto request)
        {
            var existingUser = await _authRepository.GetUserByUsernameAsync(request.Username);
            if (existingUser != null)
            {
                throw new InvalidOperationException("Username already exists");
            }

            var existingEmail = await _authRepository.GetUserByEmailAsync(request.Email);
            if (existingEmail != null)
            {
                throw new InvalidOperationException("Email already exists");
            }

            var passwordHash = HashPassword(request.Password);

            var user = await _authRepository.CreateUserAsync(
                request.Username,
                request.Email,
                passwordHash,
                request.FirstName,
                request.LastName
            );

            var roles = await _authRepository.GetUserRolesAsync(user.UserId);
            var roleNames = roles.Select(r => r.RoleName).ToList();

            var token = GenerateJwtToken(user.UserId, user.Username, roleNames);

            return new LoginResponseDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Roles = roleNames,
                Token = token
            };
        }

        public string HashPassword(string password)
        {
            return _passwordHasher.HashPassword(null, password);
        }

        public bool VerifyPassword(string password, string passwordHash)
        {
            var result = _passwordHasher.VerifyHashedPassword(null, passwordHash, password);
            return result == PasswordVerificationResult.Success;
        }

        public string GenerateJwtToken(int userId, string username, List<string> roles)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];
            var expiryMinutes = int.Parse(jwtSettings["ExpiryMinutes"]);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Name, username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
