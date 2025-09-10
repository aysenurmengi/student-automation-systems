namespace StudentAutomation.Api.Domain;
public enum CourseStatus { Planned = 0, Started = 1, Completed = 2 }

public class Course
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = default!;
    public string Name { get; set; } = default!;
    public CourseStatus Status { get; set; } = CourseStatus.Planned;

    public string TeacherId { get; set; } = default!;
    public Teacher Teacher { get; set; } = default!;

    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<CourseComment> Comments { get; set; } = new List<CourseComment>();
}
