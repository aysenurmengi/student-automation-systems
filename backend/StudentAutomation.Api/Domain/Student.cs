using Microsoft.AspNetCore.Identity;

namespace StudentAutomation.Api.Domain;
public class Student
{
    public string UserId { get; set; } = default!;
    public IdentityUser User { get; set; }
    public int Number { get; set; }
    public string FirstName { get; set; } = default!;
    public string LastName { get; set; } = default!;
}