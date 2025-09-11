using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentAutomation.Api.Data;
using StudentAutomation.Api.Domain;

[ApiController]
[Route("api/[controller]")]
public class AttendanceController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public AttendanceController(ApplicationDbContext db) { _db = db; }

    public record AddAttendanceDto(string CourseId, string StudentId, DateTime Date, AttendanceStatus Status);

    [Authorize(Roles = "Teacher")]
    [HttpPost]
    public async Task<IActionResult> Add(AddAttendanceDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var c = await _db.Courses.FindAsync(dto.CourseId);
        if (c is null || c.TeacherId != userId) return Forbid();

        var enr = await _db.Enrollments.FirstOrDefaultAsync(e => e.CourseId == dto.CourseId && e.StudentId == dto.StudentId);
        if (enr is null) return BadRequest("Student not enrolled.");

        _db.Attendances.Add(new Attendance { EnrollmentId = enr.EnrollmentId, Date = dto.Date.Date, Status = dto.Status });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Attendance recorded" });
    }

    [Authorize(Roles = "Student")]
    [HttpGet("my")]
    public async Task<IActionResult> MyAttendance()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var att = await _db.Attendances
            .Include(a => a.Enrollment)
            .Where(a => a.Enrollment.StudentId == userId)
            .Select(a => new { a.Enrollment.CourseId, a.Date, a.Status })
            .ToListAsync();
        return Ok(att);
    }
}