using PM.Infrastructure.Data;
using PM.Infrastructure.Messaging.Consumers;
using Microsoft.EntityFrameworkCore;
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
    x.AddConsumer<UserUpdatedConsumer>();
    
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

        cfg.ReceiveEndpoint("user-updated-queue", e =>
        {
            e.ConfigureConsumer<UserUpdatedConsumer>(context);
        });
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddHttpContextAccessor();

// 1. Đăng ký SignalR
builder.Services.AddSignalR();
builder.Services.AddSingleton<Microsoft.AspNetCore.SignalR.IUserIdProvider, PM.API.Services.CustomUserIdProvider>();

// 2. Đăng ký Service đẩy thông báo Realtime
builder.Services.AddScoped<PM.Application.Contracts.INotificationService, PM.API.Services.SignalRNotificationService>();

// 3. Đăng ký ICurrentUserService
builder.Services.AddScoped<PM.Application.Contracts.ICurrentUserService, PM.API.Services.CurrentUserService>();

builder.Services.AddScoped<PM.Application.Contracts.IPMDbContext>(provider => provider.GetRequiredService<PMDbContext>());

builder.Services.AddExceptionHandler<PM.API.Middlewares.GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// 5. Đăng ký HttpClient cho DocumentIntelligence Webhook Client
builder.Services.AddHttpClient<PM.Application.Contracts.IDocumentIntelligenceServiceClient, PM.Infrastructure.Services.DocumentIntelligenceServiceClient>(client =>
{
    client.BaseAddress = new Uri("http://localhost:5003");
    // Nếu Python service không phản hồi trong 5 giây, bỏ qua
    client.Timeout = TimeSpan.FromSeconds(5);
});

var app = builder.Build();

app.UseExceptionHandler();

app.UseAuthorization();
app.MapControllers();

// 4. Map endpoint cho Hub
app.MapHub<PM.API.Hubs.NotificationHub>("/hubs/notifications");

app.Run();


