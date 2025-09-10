using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using StudentAutomation.Api.Domain;

namespace StudentAutomation.Api.Data;

public class ApplicationDbContext : IdentityDbContext<IdentityUser, IdentityRole, string>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Student> Students => Set<Student>();
    public DbSet<Teacher> Teachers => Set<Teacher>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<CourseComment> CourseComments => Set<CourseComment>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<Grade> Grades => Set<Grade>();
    public DbSet<Attendance> Attendances => Set<Attendance>();


    //ilişkileri belirlemek için
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        //Student
        builder.Entity<Student>(e =>
        {
            e.HasKey(x => x.UserId);
            e.HasIndex(x => x.Number).IsUnique();
            
            e.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        //Teacher
        builder.Entity<Teacher>(e =>
        {
            e.HasKey(x => x.UserId);

            e.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        //Course
        builder.Entity<Course>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Code).IsUnique();
            e.HasOne(x => x.Teacher)
                .WithMany(t => t.Courses)
                .HasForeignKey(x => x.TeacherId)
                .HasPrincipalKey(t => t.UserId) //FK-teacher.userId
                .OnDelete(DeleteBehavior.Cascade);
        });

        //Enrollment
        builder.Entity<Enrollment>(e =>
        {
            e.HasKey(x => x.EnrollmentId); //composite key
            e.HasOne(x => x.Student)
                .WithMany()
                .HasForeignKey(x => x.StudentId)
                .HasPrincipalKey(s => s.UserId) //FK-student.userId
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Course)
                .WithMany(c => c.Enrollments)
                .HasForeignKey(x => x.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasIndex(x => new { x.StudentId, x.CourseId }).IsUnique(); //aynı öğrenci aynı derse birden fazla kayıt olmasın
        });

        //Grade
        builder.Entity<Grade>()
            .HasOne(x => x.Enrollment)
            .WithMany(e => e.Grades)
            .HasForeignKey(x => x.EnrollmentId)
            .OnDelete(DeleteBehavior.Cascade);

        //Attendance
        builder.Entity<Attendance>(e =>
        {
            e.HasOne(x => x.Enrollment)
                .WithMany(e => e.Attendances)
                .HasForeignKey(x => x.EnrollmentId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasIndex(x => new { x.EnrollmentId, x.Date }).IsUnique();
        });

        //CourseComment
        builder.Entity<CourseComment>(e =>
        {
            e.HasOne(x => x.Course)
                .WithMany(c => c.Comments)
                .HasForeignKey(x => x.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Teacher)
                .WithMany()
                .HasForeignKey(x => x.TeacherId)
                .HasPrincipalKey(t => t.UserId) //FK-teacher.userId
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Student)
                .WithMany()
                .HasForeignKey(x => x.StudentId)
                .HasPrincipalKey(s => s.UserId) //FK-student.userId
                .OnDelete(DeleteBehavior.SetNull); //öğrenci silinirse yorumu silme, studentId null olsun
        });


    }

}