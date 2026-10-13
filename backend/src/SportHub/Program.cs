using Microsoft.EntityFrameworkCore;
using SportHub.Application.Interfaces;
using SportHub.Application.Services;
using SportHub.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// MySQL + EF Core
var connectionString = builder.Configuration.GetConnectionString("Default");
builder.Services.AddDbContext<SportHubDbContext>(opt =>
    opt.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

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

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.MapControllers();
app.Run();
