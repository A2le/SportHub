using Microsoft.EntityFrameworkCore;
using SportHub.Application.Interfaces;
using SportHub.Application.Services;
using SportHub.Infrastructure.Data;
using Amazon.SimpleEmail;
using Amazon.SimpleNotificationService;
using Amazon.Extensions.NETCore.Setup;

var builder = WebApplication.CreateBuilder(args);

// MySQL + EF Core
var connectionString = builder.Configuration.GetConnectionString("Default");
builder.Services.AddDbContext<SportHubDbContext>(opt =>
    opt.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 35)),
        mySqlOptions => mySqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorNumbersToAdd: null)));

// Repositories
builder.Services.AddScoped<IEventRepository, EventRepository>();
builder.Services.AddScoped<ITeamRepository, TeamRepository>();
builder.Services.AddScoped<IRegistrationRepository, RegistrationRepository>();
builder.Services.AddScoped<IFixtureRepository, FixtureRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();

// AutoMapper
builder.Services.AddAutoMapper(cfg => cfg.AddMaps(typeof(SportHub.Application.Mapping.EventProfile).Assembly));

// Application Services
builder.Services.AddScoped<EventService>();
builder.Services.AddScoped<TeamService>();
builder.Services.AddScoped<RegistrationService>();
builder.Services.AddScoped<FixtureService>();

builder.Services.AddScoped<WhatsAppService>();
builder.Services.AddScoped<EmailNotificationService>();

// AWS SDK Services
builder.Services.AddAWSService<IAmazonSimpleEmailService>();
builder.Services.AddAWSService<IAmazonSimpleNotificationService>();

// CORS for frontend demo
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()));

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        policy =>
        {
            policy.WithOrigins("http://localhost:5173", 
                             "http://localhost:5174", 
                             "http://*.localhost:5173")
                .SetIsOriginAllowedToAllowWildcardSubdomains()
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials(); // Required for SignalR
        });
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

// Enable CORS
app.UseCors("AllowAll");


app.UseCors();

// Health endpoint
app.MapGet("/health", () => Results.Ok(new 
{ 
    status = "Healthy", 
    timestamp = DateTime.UtcNow,
    environment = app.Environment.EnvironmentName 
}));

// Root endpoint
app.MapGet("/", () => Results.Ok(new 
{
    name = "SportHub API",
    version = "1.0",
    endpoints = new[] { "/Events", "/Teams", "/Registrations", "/Fixtures", "/swagger" }
}));

app.MapControllers();
app.Run();
