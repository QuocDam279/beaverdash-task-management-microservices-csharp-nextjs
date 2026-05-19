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
        cfg.Host("localhost", "/", h => {
            h.Username(Environment.GetEnvironmentVariable("RABBITMQ_USER") ?? "guest");
            h.Password(Environment.GetEnvironmentVariable("RABBITMQ_PASS") ?? "guest");
        });
    });
});

builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

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

builder.Services.AddScoped<Identity.Application.Contracts.IIdentityDbContext>(provider => provider.GetRequiredService<IdentityDbContext>());
var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();


