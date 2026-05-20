using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using DotNetEnv;
using Yarp.ReverseProxy.Transforms;

var builder = WebApplication.CreateBuilder(args);

// Load .env
var envPath = Path.Combine(Directory.GetCurrentDirectory(), "../.env");
if (File.Exists(envPath)) Env.Load(envPath);
else Env.Load();

var secret = Environment.GetEnvironmentVariable("JWT_SECRET");
var issuer = builder.Configuration["JwtSettings:Issuer"] ?? "BeaverdashIdentity";
var audience = builder.Configuration["JwtSettings:Audience"] ?? "BeaverdashApp";

// Add Authentication & Authorization
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret ?? string.Empty))
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAuthenticatedUser", policy =>
    {
        policy.RequireAuthenticatedUser();
    });
});

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"))
    .AddTransforms(builderContext =>
    {
        builderContext.AddRequestTransform(transformContext =>
        {
            if (transformContext.HttpContext.User.Identity?.IsAuthenticated == true)
            {
                var userId = transformContext.HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                             ?? transformContext.HttpContext.User.FindFirst("sub")?.Value;
                             
                if (!string.IsNullOrEmpty(userId))
                {
                    transformContext.ProxyRequest.Headers.Add("X-User-Id", userId);
                    transformContext.ProxyRequest.Headers.Remove("Authorization");
                }
            }
            return ValueTask.CompletedTask;
        });
    });

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.MapReverseProxy();

app.Run();
