namespace StudentAutomation.Api.Domain;
public class Grade
{
    public int GradeId { get; set; }
    public int EnrollmentId { get; set; }
    public Enrollment Enrollment { get; set; } = default!;

    public decimal Score { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}