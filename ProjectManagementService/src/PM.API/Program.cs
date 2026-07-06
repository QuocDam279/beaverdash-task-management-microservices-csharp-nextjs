using PM.Infrastructure.Data;
using PM.Infrastructure.Messaging.Consumers;
using Microsoft.EntityFrameworkCore;
using MassTransit;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// Configure maximum request body size limit to 100MB
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 100 * 1024 * 1024; // 100MB
});
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 100 * 1024 * 1024; // 100MB
});

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
        var rabbitMqHost = Environment.GetEnvironmentVariable("RABBITMQ_HOST") ?? "localhost";
        cfg.Host(rabbitMqHost, "/", h => {
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

// 2.1. Đăng ký Service gửi Email thông báo
builder.Services.AddScoped<PM.Application.Contracts.IEmailService, PM.Infrastructure.Services.EmailService>();

// 3. Đăng ký ICurrentUserService
builder.Services.AddScoped<PM.Application.Contracts.ICurrentUserService, PM.API.Services.CurrentUserService>();

builder.Services.AddScoped<PM.Application.Contracts.IPMDbContext>(provider => provider.GetRequiredService<PMDbContext>());

builder.Services.AddHostedService<PM.Infrastructure.Services.OutboxBackgroundService>();
builder.Services.AddHostedService<PM.Infrastructure.Services.DeadlineReminderBackgroundService>();

builder.Services.AddExceptionHandler<PM.API.Middlewares.GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// 5. Đăng ký HttpClient cho AIAssistant Webhook Client
builder.Services.AddHttpClient<PM.Application.Contracts.IAIAssistantServiceClient, PM.Infrastructure.Services.AIAssistantServiceClient>(client =>
{
    var aiAssistantUrl = Environment.GetEnvironmentVariable("AI_ASSISTANT_SERVICE_URL") ?? "http://localhost:5003";
    client.BaseAddress = new Uri(aiAssistantUrl);
    // Nếu Python service không phản hồi trong 5 giây, bỏ qua
    client.Timeout = TimeSpan.FromSeconds(5);
});

var app = builder.Build();

app.UseExceptionHandler();

app.UseStaticFiles();

app.UseAuthorization();
app.MapControllers();

// 4. Map endpoint cho Hub
app.MapHub<PM.API.Hubs.NotificationHub>("/hubs/notifications");
app.MapHub<PM.API.Hubs.ChatHub>("/hubs/chat");

// Apply migrations on startup with retry logic
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<PMDbContext>();
    int retryCount = 10;
    int delaySeconds = 3;
    for (int i = 1; i <= retryCount; i++)
    {
        try
        {
            Console.WriteLine($"[Migration] Applying PM DB migrations (Attempt {i}/{retryCount})...");
            context.Database.Migrate();
            Console.WriteLine("[Migration] PM DB migrations applied successfully.");
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


