using Identity.Infrastructure.Data;
using Identity.Application.Contracts;
using Identity.Infrastructure.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MassTransit;

var builder = WebApplication.CreateBuilder(args);

// Load file .env từ thư mục gốc của repo
var envPath = Path.Combine(Directory.GetCurrentDirectory(), "../../../.env");
if (File.Exists(envPath)) DotNetEnv.Env.Load(envPath);
else DotNetEnv.Env.Load(); // fallback: tìm .env ở cùng cấp

builder.Services.AddDbContext<IdentityDbContext>(options =>
    options.UseNpgsql(Environment.GetEnvironmentVariable("IDENTITY_DB_CONNECTION")));

builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Identity.Application.Features.Users.Commands.CreateUserCommand).Assembly));

builder.Services.AddMassTransit(x =>
{
    x.UsingRabbitMq((context, cfg) =>
    {
        var rabbitMqHost = Environment.GetEnvironmentVariable("RABBITMQ_HOST") ?? "localhost";
        cfg.Host(rabbitMqHost, "/", h => {
            h.Username(Environment.GetEnvironmentVariable("RABBITMQ_USER") ?? "guest");
            h.Password(Environment.GetEnvironmentVariable("RABBITMQ_PASS") ?? "guest");
        });
    });
});

builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddSingleton<Identity.Application.Contracts.IGoogleTokenValidator, Identity.Infrastructure.Services.GoogleTokenValidator>();

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secret = Environment.GetEnvironmentVariable("JWT_SECRET");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.GetValue<string>("Issuer"),
            ValidAudience = jwtSettings.GetValue<string>("Audience"),
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret!))
        };
    });

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddScoped<Identity.Application.Contracts.IUserRepository, Identity.Infrastructure.Data.UserRepository>();

builder.Services.AddExceptionHandler<Identity.API.Middlewares.GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

var app = builder.Build();

app.UseExceptionHandler();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Apply migrations on startup with retry logic
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();
    int retryCount = 10;
    int delaySeconds = 3;
    for (int i = 1; i <= retryCount; i++)
    {
        try
        {
            Console.WriteLine($"[Migration] Applying Identity DB migrations (Attempt {i}/{retryCount})...");
            context.Database.Migrate();
            Console.WriteLine("[Migration] Identity DB migrations applied successfully.");
            break;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Migration] Error on attempt {i}: {ex.Message}");
            if (i == retryCount) throw;
            System.Threading.Thread.Sleep(TimeSpan.FromSeconds(delaySeconds));
        }
    }
}

app.Run();


