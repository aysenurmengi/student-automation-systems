using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentAutomation.Api.Data;
using StudentAutomation.Api.Domain;

[ApiController]
[Route("api/[controller]")]
public class GradesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public GradesController(ApplicationDbContext db) { _db = db; }

    public record AddGradeDto(string CourseId, string StudentId, decimal Score);

    [Authorize(Roles = "Teacher")]
    [HttpPost]
    public async Task<IActionResult> Add(AddGradeDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var c = await _db.Courses.FindAsync(dto.CourseId);
        if (c is null || c.TeacherId != userId) return Forbid();

        var enr = await _db.Enrollments.FirstOrDefaultAsync(e => e.CourseId == dto.CourseId && e.StudentId == dto.StudentId);
        if (enr is null) return BadRequest("Student not enrolled.");

        _db.Grades.Add(new Grade { EnrollmentId = enr.EnrollmentId, Score = dto.Score, CreatedAt = DateTime.UtcNow });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Grade added" });
    }

    [Authorize(Roles = "Student")]
    [HttpGet("my")]
    public async Task<IActionResult> MyGrades()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var grades = await _db.Grades
            .Include(g => g.Enrollment)
                .ThenInclude(e => e.Course)
            .Where(g => g.Enrollment.StudentId == userId)
            .Select(g => new { g.Enrollment.CourseId, Code = g.Enrollment.Course.Code, Name = g.Enrollment.Course.Name, g.Score, g.CreatedAt })
            .OrderByDescending(x=>x.CreatedAt)
            .ToListAsync();
        return Ok(grades);
    }
}