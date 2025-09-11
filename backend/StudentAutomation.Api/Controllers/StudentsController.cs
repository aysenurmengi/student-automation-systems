using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentAutomation.Api.Data;
using StudentAutomation.Api.Domain;

[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public StudentsController(ApplicationDbContext db) { _db = db; }

    // Liste (Admin,Teacher)
    [Authorize(Roles = "Admin,Teacher")]
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _db.Students.AsNoTracking().ToListAsync());

    // Ekle (Admin,Teacher)
    public record UpsertStudentDto(string FirstName, string LastName, string Number);
    [Authorize(Roles = "Admin,Teacher")]
    [HttpPost]
    public async Task<IActionResult> Create(UpsertStudentDto dto)
    {
        var s = new Student { UserId = Guid.NewGuid().ToString(), FirstName = dto.FirstName, LastName = dto.LastName, Number = dto.Number };
        // Not: Gerçekte UserId IdentityUser’a bağlı; bu basit örnekte yalnızca domain ekliyoruz.
        _db.Students.Add(s);
        await _db.SaveChangesAsync();
        return Ok(s);
    }

    // Güncelle (Admin,Teacher)
    [Authorize(Roles = "Admin,Teacher")]
    [HttpPut("{userId}")]
    public async Task<IActionResult> Update(string userId, UpsertStudentDto dto)
    {
        var s = await _db.Students.FindAsync(userId);
        if (s is null) return NotFound();
        s.FirstName = dto.FirstName; s.LastName = dto.LastName; s.Number = dto.Number;
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
