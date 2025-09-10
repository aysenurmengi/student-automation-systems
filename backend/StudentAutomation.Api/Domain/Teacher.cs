using Microsoft.AspNetCore.Identity;

namespace StudentAutomation.Api.Domain;
public class Teacher
{
    public string UserId { get; set; } = default!;
    public IdentityUser? User { get; set; }

    public string? Title { get; set; }
    public string FirstName { get; set; } = default!;
    public string LastName { get; set; } = default!;

    public ICollection<Course> Courses { get; set; } = new List<Course>();

}