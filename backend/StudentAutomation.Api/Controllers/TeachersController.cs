using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentAutomation.Api.Data;
using StudentAutomation.Api.Domain;

[ApiController]
[Route("api/[controller]")]
public class TeachersController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly UserManager<IdentityUser> _users;
    private readonly RoleManager<IdentityRole> _roles;
    public TeachersController(ApplicationDbContext db, UserManager<IdentityUser> users, RoleManager<IdentityRole> roles)
    {
        _db = db;
        _users = users;
        _roles = roles;
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _db.Teachers.AsNoTracking().ToListAsync());

    public record UpsertTeacherDto(string FirstName, string LastName, string Password);

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(UpsertTeacherDto dto)
    {
        // 1) IdentityUser oluştur
    var user = new IdentityUser { UserName = $"teacher-{Guid.NewGuid():N}" };
    var create = await _users.CreateAsync(user, dto.Password);
    if (!create.Succeeded)
        return BadRequest(create.Errors.Select(e => e.Description));

    // 2) Role hazırla + ata
    if (!await _roles.RoleExistsAsync("Teacher"))
        await _roles.CreateAsync(new IdentityRole("Teacher"));

    var addRole = await _users.AddToRoleAsync(user, "Teacher");
    if (!addRole.Succeeded)
        return BadRequest(addRole.Errors.Select(e => e.Description));

    // 3) Domain kaydı (FK = user.Id)
    _db.Teachers.Add(new Teacher
    {
        UserId    = user.Id,
        FirstName = dto.FirstName,
        LastName  = dto.LastName
    });

    await _db.SaveChangesAsync();
    return Ok(new { message = "Teacher created." });
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{userId}")]
    public async Task<IActionResult> Update(string userId, UpsertTeacherDto dto)
    {
        var t = await _db.Teachers.FindAsync(userId);
        if (t is null) return NotFound();
        t.FirstName = dto.FirstName; t.LastName = dto.LastName;
        await _db.SaveChangesAsync();
        return Ok(t);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("{userId}")]
    public async Task<IActionResult> Get(string userId)
    {
        var t = await _db.Teachers.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == userId);
        return t is null ? NotFound() : Ok(t);
    }
}
