using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentAutomation.Api.Data;
using StudentAutomation.Api.Domain;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public CoursesController(ApplicationDbContext db) { _db = db; }

    public record CreateCourseDto(string Code, string Name, string? TeacherId);
    public record UpdateStatusDto(CourseStatus Status); // enum kullan

    private async Task<Student?> GetCurrentStudentAsync()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return null;

        return await _db.Students
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.UserId == userId);
    }

    [Authorize(Roles = "Admin,Teacher")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateCourseDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var teacherId = dto.TeacherId;
        if (User.IsInRole("Teacher"))
        {
            teacherId = userId;
        }
        else if (User.IsInRole("Admin"))
        {
            if (string.IsNullOrWhiteSpace(teacherId))
                return BadRequest("TeacherId is required for Admin.");
        }

        var c = new Course
        {
            CourseId = Guid.NewGuid().ToString("N"),
            Code = dto.Code,
            Name = dto.Name,
            TeacherId = teacherId!
        };

        _db.Courses.Add(c);
        await _db.SaveChangesAsync();
        return Ok(c);
    }

    // Liste (herkes)
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _db.Courses.AsNoTracking().ToListAsync());

   

    // Teacher status günceller (kendi dersinde)
    [Authorize(Roles = "Teacher")]
    [HttpPut("{courseId}/status")]
    public async Task<IActionResult> UpdateStatus(string courseId, UpdateStatusDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var c = await _db.Courses.FindAsync(courseId);
        if (c is null ) return NotFound();

        c.Status = dto.Status; // enum
        await _db.SaveChangesAsync();
        return Ok(c);
    }

    // Enroll işlemleri
    public record EnrollDto(string StudentId);

    [Authorize(Roles = "Teacher")]
    [HttpPost("{courseId}/enroll")]
    public async Task<IActionResult> Enroll(string courseId, EnrollDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var c = await _db.Courses.FindAsync(courseId);
        if (c is null) return NotFound();

        var exists = await _db.Enrollments
            .AnyAsync(e => e.CourseId == courseId && e.StudentId == dto.StudentId);
        if (exists) return BadRequest("Already enrolled.");

        _db.Enrollments.Add(new Enrollment { CourseId = courseId, StudentId = dto.StudentId });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Enrolled" });
    }

    [Authorize(Roles = "Teacher")]
    [HttpDelete("{courseId}/enroll/{studentId}")]
    public async Task<IActionResult> Unenroll(string courseId, string studentId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var c = await _db.Courses.FindAsync(courseId);
        if (c is null ) return NotFound();

        var enr = await _db.Enrollments
            .FirstOrDefaultAsync(e => e.CourseId == courseId && e.StudentId == studentId);
        if (enr is null) return NotFound();

        _db.Enrollments.Remove(enr);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Unenrolled" });
    }

    [Authorize(Roles = "Teacher")]
    [HttpGet("{courseId}/students")]
    public async Task<IActionResult> CourseStudents(string courseId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var c = await _db.Courses
            .Include(x => x.Enrollments)
            .ThenInclude(e => e.Student)
            .FirstOrDefaultAsync(c => c.CourseId == courseId);

        if (c is null) return NotFound();

        var students = c.Enrollments.Select(e => new {
            e.StudentId,
            e.Student.Number,
            e.Student.FirstName,
            e.Student.LastName
        });

        return Ok(students);
    }

    // Yorum (Teacher → own course)
    public record CommentDto(string StudentId, string Comment);

    [Authorize(Roles = "Teacher")]
    [HttpPost("{courseId}/comments")]
    public async Task<IActionResult> Comment(string courseId, CommentDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var c = await _db.Courses.FindAsync(courseId);
        if (c is null || c.TeacherId != userId) return Forbid();

        _db.CourseComments.Add(new CourseComment
        {
            CourseId = courseId,
            TeacherId = userId,
            StudentId = dto.StudentId,
            Comment = dto.Comment
        });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Comment added" });
    }

    [Authorize(Roles = "Teacher,Student")]
    [HttpGet("{courseId}/comments")]
    public async Task<IActionResult> GetComments(string courseId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var c = await _db.Courses.FindAsync(courseId);
        if (c is null) return NotFound();
        // öğretmen kendisne ait yorumları görsün
        if (User.IsInRole("Teacher"))
        {
            if (c.TeacherId != userId) return Forbid();
            var comments = await _db.CourseComments
                .Where(cc => cc.CourseId == courseId)
                .ToListAsync();

            return Ok(comments);
        }

        if (User.IsInRole("Student"))
        {
            var st = await _db.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (st is null) return Forbid();
            var comments = await _db.CourseComments
                .Where(cc => cc.CourseId == courseId && cc.StudentId == st.UserId)
                .ToListAsync();

            return Ok(comments);
        }
        return Forbid();

    }

    [Authorize(Roles = "Student")]
    [HttpGet("{courseId}/comments/mine")]
    public async Task<IActionResult> MyComments()
    {
        var st = await GetCurrentStudentAsync();
        if (st is null) return Forbid();

        var comments = await _db.CourseComments
            .Where(cc => cc.StudentId == st.UserId)
            .Include(cc => cc.Course)
            .Select(cc => new
            {
                cc.Course.Code,
                cc.Course.Name,
                cc.Comment,
                cc.CreatedAt
            })
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(comments);
    }


    [Authorize(Roles = "Student")]
    [HttpGet("mine")]
    public async Task<IActionResult> MyCourses()
    {
        var st = await GetCurrentStudentAsync();
        if (st is null) return Forbid();

        var courses = await _db.Enrollments
            .Where(e => e.StudentId == st.UserId)
            .Include(e => e.Course)
            .Select(e => new
            {
                e.Course.CourseId,
                e.Course.Code,
                e.Course.Name,
                e.Course.Status
            })
            .ToListAsync();

        return Ok(courses);
    }
}
