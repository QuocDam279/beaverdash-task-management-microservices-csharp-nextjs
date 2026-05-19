using PM.Infrastructure.Data;
using PM.Infrastructure.Messaging.Consumers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MassTransit;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// Load file .env từ thư mục gốc của repo
var envPath = Path.Combine(Directory.GetCurrentDirectory(), "../../../.env");
if (File.Exists(envPath)) DotNetEnv.Env.Load(envPath);
else DotNetEnv.Env.Load(); // fallback: tìm .env ở cùng cấp

builder.Services.AddDbContext<PMDbContext>(options =>
    options.UseNpgsql(Environment.GetEnvironmentVariable("PM_DB_CONNECTION")));

builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(PM.Application.Features.Projects.Project.Commands.CreateProjectCommand).Assembly));

builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<UserCreatedConsumer>();
    
    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("localhost", "/", h => {
            h.Username(Environment.GetEnvironmentVariable("RABBITMQ_USER") ?? "guest");
            h.Password(Environment.GetEnvironmentVariable("RABBITMQ_PASS") ?? "guest");
        });

        cfg.ReceiveEndpoint("user-created-queue", e =>
        {
            e.ConfigureConsumer<UserCreatedConsumer>(context);
        });
    });
});

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

// 1. Đăng ký SignalR
builder.Services.AddSignalR();

// 2. Đăng ký Service đẩy thông báo Realtime
builder.Services.AddScoped<PM.Application.Contracts.INotificationService, PM.API.Services.SignalRNotificationService>();

builder.Services.AddScoped<PM.Application.Contracts.IPMDbContext>(provider => provider.GetRequiredService<PMDbContext>());
var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// 3. Map endpoint cho Hub
app.MapHub<PM.API.Hubs.NotificationHub>("/hubs/notifications");

app.Run();


