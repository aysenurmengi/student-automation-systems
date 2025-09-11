using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using StudentAutomation.Api.Data;
using StudentAutomation.Api.Domain;

[ApiController]
[Route("api/[controller]")]

public class AuthController : ControllerBase
{
    private readonly UserManager<IdentityUser> _users;
    private readonly SignInManager<IdentityUser> _signIn;
    private readonly RoleManager<IdentityRole> _roles;
    private readonly ApplicationDbContext _db;
    public AuthController(UserManager<IdentityUser> users, SignInManager<IdentityUser> signIn, RoleManager<IdentityRole> roles, ApplicationDbContext db)
    {
        _users = users;
        _signIn = signIn;
        _roles = roles;
        _db = db;
    }

    [HttpPost("register/student")]
    public async Task<IActionResult> RegisterStudent(RegisterStudentDto dto)
    {
        await EnsureRole("Student");
        if (await _db.Students.AnyAsync(s => s.Number == dto.Number))
            return BadRequest("Student with this number already exists.");

        var user = new IdentityUser { UserName = $"student-{dto.Number}" };
        var result = await _users.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(result.Errors);
        await _users.AddToRoleAsync(user, "Student");

        _db.Students.Add(new Student
        {
            UserId = user.Id,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Number = dto.Number
        });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Student registered successfully" });
    }

    [HttpPost("register/teacher")]
    public async Task<IActionResult> RegisterTeacher(RegisterTeacherDto dto)
    {
        await EnsureRole("Teacher");
        var user = new IdentityUser { UserName = $"teacher-{Guid.NewGuid():N}" };
        var res = await _users.CreateAsync(user, dto.Password);
        if (!res.Succeeded) return BadRequest(res.Errors);
        await _users.AddToRoleAsync(user, "Teacher");

        _db.Teachers.Add(new Teacher { UserId = user.Id, FirstName = dto.FirstName, LastName = dto.LastName });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Teacher registered." });
    }

    [HttpPost("register/admin")]
    public async Task<IActionResult> RegisterAdmin(RegisterAdminDto dto)
    {
        await EnsureRole("Admin");
        if (await _users.FindByNameAsync(dto.UserName) != null)
            return BadRequest("Username in use.");
        var user = new IdentityUser { UserName = dto.UserName, Email = dto.Email };
        var res = await _users.CreateAsync(user, dto.Password);
        if (!res.Succeeded) return BadRequest(res.Errors);
        await _users.AddToRoleAsync(user, "Admin");
        return Ok(new { message = "Admin registered." });
    }

    [HttpPost("login/student")]
    public async Task<IActionResult> LoginStudent(LoginStudentDto dto)
    {
        var st = await _db.Students.AsNoTracking().FirstOrDefaultAsync(s => s.Number == dto.Number);
        if (st is null) return Unauthorized();
        var user = await _users.FindByIdAsync(st.UserId);
        if (user is null) return Unauthorized();

        var result = await _signIn.PasswordSignInAsync(user.UserName!, dto.Password, false, false);
        if (!result.Succeeded) return Unauthorized();
        return Ok(new { message = "Logged in (student)" });
    }

    [HttpPost("login/teacher")]
    public async Task<IActionResult> LoginTeacher(LoginTeacherDto dto)
    {
        var tc = await _db.Teachers.AsNoTracking().FirstOrDefaultAsync(t => t.FirstName == dto.FirstName && t.LastName == dto.LastName);
        if (tc is null) return Unauthorized();
        var user = await _users.FindByIdAsync(tc.UserId);
        if (user is null) return Unauthorized();

        var result = await _signIn.PasswordSignInAsync(user.UserName!, dto.Password, false, false);
        if (!result.Succeeded) return Unauthorized();
        return Ok(new { message = "Logged in (teacher)" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var result = await _signIn.PasswordSignInAsync(dto.UserName, dto.Password, false, false);
        if (!result.Succeeded) return Unauthorized();
        return Ok(new { message = "Logged in" });
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _signIn.SignOutAsync();
        return Ok(new { message = "Logged out" });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _users.FindByIdAsync(userId!);
        var roles = await _users.GetRolesAsync(user!);

        object? profile = null;
        if (roles.Contains("Student"))
        {
            var st = await _db.Students.AsNoTracking().FirstOrDefaultAsync(s => s.UserId == user!.Id);
            profile = st is null ? null : new { st.UserId, st.FirstName, st.LastName, st.Number };
        }
        else if (roles.Contains("Teacher"))
        {
            var tc = await _db.Teachers.AsNoTracking().FirstOrDefaultAsync(t => t.UserId == user!.Id);
            profile = tc is null ? null : new { tc.UserId, tc.FirstName, tc.LastName };
        }
        else if (roles.Contains("Admin"))
        {
            profile = new { userName = user!.UserName };
        }
        
        return Ok(new { userId = user!.Id, roles, profile });
    }

    private async Task EnsureRole(string role)
    {
        if (!await _roles.RoleExistsAsync(role))
            await _roles.CreateAsync(new IdentityRole(role));
    }
}