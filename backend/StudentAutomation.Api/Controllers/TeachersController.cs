using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentAutomation.Api.Data;
using StudentAutomation.Api.Domain;

[ApiController]
[Route("api/[controller]")]
public class TeachersController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public TeachersController(ApplicationDbContext db) { _db = db; }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _db.Teachers.AsNoTracking().ToListAsync());

    public record UpsertTeacherDto(string FirstName, string LastName);

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(UpsertTeacherDto dto)
    {
        var t = new Teacher { UserId = Guid.NewGuid().ToString(), FirstName = dto.FirstName, LastName = dto.LastName };
        _db.Teachers.Add(t);
        await _db.SaveChangesAsync();
        return Ok(t);
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
