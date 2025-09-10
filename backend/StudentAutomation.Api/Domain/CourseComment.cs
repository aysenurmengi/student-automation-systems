using StudentAutomation.Api.Domain;

namespace StudentAutomation.Api.Domain;
public class CourseComment
{
    public int CourseCommentId { get; set; }
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = default!;

    public string TeacherId { get; set; } = default!;
    public Teacher Teacher { get; set; } = default!;

    public string? StudentId { get; set; } = default!;
    public Student? Student { get; set; } = default!;

    public string Comment { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}