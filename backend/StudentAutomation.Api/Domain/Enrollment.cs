using StudentAutomation.Api.Domain;

namespace StudentAutomation.Api.Domain;

public class Enrollment
{
    public int EnrollmentId { get; set; }
    public string StudentId { get; set; } = default!;
    public Student Student { get; set; } = default!;

    public Guid CourseId { get; set; }
    public Course Course { get; set; } = default!;

    public ICollection<Grade> Grades { get; set; } = new List<Grade>();
    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
}