namespace StudentAutomation.Api.Domain;
public enum AttendanceStatus { Present = 0, Absent = 1, Excused = 2 }

public class Attendance
{
    public int AttendanceId { get; set; }
    public int EnrollmentId { get; set; } //hangi öğrenci-öğretmen için
    public Enrollment Enrollment { get; set; } = default!;

    public DateTime Date { get; set; } = DateTime.UtcNow;
    public AttendanceStatus Status { get; set; } = AttendanceStatus.Present;
}
