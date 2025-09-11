using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StudentAutomation.Api.Data;

var builder = WebApplication.CreateBuilder(args);

//dbcontext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services
    .AddIdentityCore<IdentityUser>(o =>
    {
        o.Password.RequiredLength = 6;
        o.Password.RequireDigit = false;
        o.Password.RequireUppercase = false;
        o.Password.RequireNonAlphanumeric = false;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddSignInManager()
    .AddDefaultTokenProviders();

// Authentication (cookie)
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme       = IdentityConstants.ApplicationScheme;
    options.DefaultSignInScheme = IdentityConstants.ExternalScheme;
})
.AddIdentityCookies();

builder.Services.ConfigureApplicationCookie(o =>
{
    // API'de redirect yerine 401/403
    o.Events.OnRedirectToLogin = ctx => {
        if (ctx.Request.Path.StartsWithSegments("/api")) { ctx.Response.StatusCode = 401; return Task.CompletedTask; }
        ctx.Response.Redirect(ctx.RedirectUri); return Task.CompletedTask;
    };
    o.Events.OnRedirectToAccessDenied = ctx => {
        if (ctx.Request.Path.StartsWithSegments("/api")) { ctx.Response.StatusCode = 403; return Task.CompletedTask; }
        ctx.Response.Redirect(ctx.RedirectUri); return Task.CompletedTask;
    };

    o.Cookie.HttpOnly = true;
    o.Cookie.SameSite = SameSiteMode.Lax;
    o.Cookie.SecurePolicy = CookieSecurePolicy.None;
});


builder.Services.AddCors(o =>
{
    o.AddPolicy("frontend", p => p
      .WithOrigins("http://localhost:5173")
      .AllowAnyHeader()
      .AllowAnyMethod()
      .AllowCredentials());
});


builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();

app.UseRouting();

app.UseCors("frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


app.Run();

