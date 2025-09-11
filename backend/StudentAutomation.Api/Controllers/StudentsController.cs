using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentAutomation.Api.Data;
using StudentAutomation.Api.Domain;

[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly UserManager<IdentityUser> _users;
    private readonly RoleManager<IdentityRole> _roles;
    public StudentsController(ApplicationDbContext db, UserManager<IdentityUser> users, RoleManager<IdentityRole> roles)
    {
        _db = db;
        _users = users;
        _roles = roles;
    }

    // Liste (Admin,Teacher)
    [Authorize(Roles = "Admin,Teacher")]
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _db.Students.AsNoTracking().ToListAsync());

    // Ekle (Admin,Teacher)
    public record UpsertStudentDto(string FirstName, string LastName, string Number, string Password);
    [Authorize(Roles = "Admin,Teacher")]
    [HttpPost]
    public async Task<IActionResult> Create(UpsertStudentDto dto)
    {
        // 1) Number unique?
        if (await _db.Students.AnyAsync(s => s.Number == dto.Number))
            return BadRequest("Number already used.");

        // 2) IdentityUser oluştur
        var user = new IdentityUser { UserName = $"student-{dto.Number}" };

        var create = await _users.CreateAsync(user, dto.Password);
        if (!create.Succeeded)
            return BadRequest(create.Errors.Select(e => e.Description));

        // 3) Role hazırla + ata
        if (!await _roles.RoleExistsAsync("Student"))
            await _roles.CreateAsync(new IdentityRole("Student"));

        var addRole = await _users.AddToRoleAsync(user, "Student");
        if (!addRole.Succeeded)
            return BadRequest(addRole.Errors.Select(e => e.Description));

        // 4) Domain kaydı (FK = user.Id)
        _db.Students.Add(new Student
        {
            UserId = user.Id,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Number = dto.Number
        });

        try
        {
            await _db.SaveChangesAsync();
            return Ok(new { message = "Student created." });
        }
        catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("unique", StringComparison.OrdinalIgnoreCase) == true)
        {
            return BadRequest("Number already exists.");
        }
    }
    // Güncelle (Admin,Teacher)
    
    [Authorize(Roles = "Admin,Teacher")]
    [HttpPut("{userId}")]
    public async Task<IActionResult> Update(string userId, UpsertStudentDto dto)
    {
        var s = await _db.Students.FindAsync(userId);
        if (s is null) return NotFound();

        // Number değişiyorsa uniqueness kontrolü
        if (s.Number != dto.Number && await _db.Students.AnyAsync(x => x.Number == dto.Number))
            return BadRequest("Number already used.");

        s.FirstName = dto.FirstName;
        s.LastName  = dto.LastName;
        s.Number    = dto.Number;

        await _db.SaveChangesAsync();
        return Ok(s);
    }

    // Detay (Admin,Teacher)
    [Authorize(Roles = "Admin,Teacher")]
    [HttpGet("{userId}")]
    public async Task<IActionResult> Get(string userId)
    {
        var s = await _db.Students.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == userId);
        return s is null ? NotFound() : Ok(s);
    }

    // Student kendi profilini görsün
    [Authorize(Roles = "Student")]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var s = await _db.Students.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == userId);
        return s is null ? NotFound() : Ok(s);
    }
}
