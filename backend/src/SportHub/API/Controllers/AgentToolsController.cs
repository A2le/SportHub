using Microsoft.AspNetCore.Mvc;
using SportHub.Application.DTOs;
using SportHub.Application.Services;

namespace SportHub.API.Controllers;

[ApiController]
[Route("api/agent-tools")]
public class AgentToolsController(
    EventService eventService, 
    TeamService teamService, 
    RegistrationService registrationService, 
    FixtureService fixtureService) : ControllerBase
{
    /// <summary>
    /// AI Tool: Create an event through the agent
    /// </summary>
    [HttpPost("create-event")]
    public async Task<IActionResult> CreateEventForAgent([FromBody] CreateEventForAgentRequest request)
    {
        try
        {
            var eventRequest = new CreateEventRequest(
                request.Name,
                request.Venue,
                request.StartDate,
                request.EndDate,
                request.StartTime,
                request.EndTime,
                request.NumberOfTeams,
                request.PitchStartTime,
                request.PitchEndTime,
                request.Description,
                request.AgeGroups,
                request.EventType,
                "Football", // Default sport category
                request.MatchDurationMinutes,
                request.BreakBetweenMatchesMinutes,
                request.MaxMatchesPerTeam,
                request.MinRestTimeBetweenMatches
            );

            var eventResponse = await eventService.CreateAsync(eventRequest);

            return Ok(new
            {
                Success = true,
                Message = $"Event '{request.Name}' successfully created",
                Event = new
                {
                    eventResponse.Id,
                    eventResponse.Name,
                    eventResponse.Venue,
                    eventResponse.StartDate,
                    eventResponse.EndDate,
                    eventResponse.NumberOfTeams,
                    eventResponse.AgeGroups,
                    eventResponse.PitchStartTime,
                    eventResponse.PitchEndTime,
                    eventResponse.MatchDurationMinutes
                }
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Success = false, Message = ex.Message });
        }
    }
    /// <summary>
    /// AI Tool: Get event information for the agent
    /// </summary>
    [HttpGet("events/{eventId}")]
    public async Task<IActionResult> GetEventForAgent(int eventId)
    {
        var eventInfo = await eventService.GetAsync(eventId);
        if (eventInfo == null) 
            return NotFound($"Event {eventId} not found");

        return Ok(new
        {
            eventInfo.Id,
            eventInfo.Name,
            eventInfo.EventType,
            eventInfo.StartDate,
            eventInfo.EndDate,
            eventInfo.Venue,
            eventInfo.AgeGroups,
            eventInfo.NumberOfTeams,
            MaxTeams = eventInfo.NumberOfTeams,
            eventInfo.PitchStartTime,
            eventInfo.PitchEndTime,
            eventInfo.MatchDurationMinutes,
            Status = "Open for Registration"
        });
    }

    /// <summary>
    /// AI Tool: Get current registration status
    /// </summary>
    [HttpGet("events/{eventId}/registration-status")]
    public async Task<IActionResult> GetRegistrationStatus(int eventId)
    {
        var eventInfo = await eventService.GetAsync(eventId);
        if (eventInfo == null) 
            return NotFound($"Event {eventId} not found");

        // Get actual registration count
        var registrations = await registrationService.GetByEventAsync(eventId);
        var confirmedCount = registrations.Count(r => r.Status == "Confirmed");
        var availableSpots = eventInfo.NumberOfTeams - confirmedCount;
        var registrationOpen = confirmedCount < eventInfo.NumberOfTeams;

        return Ok(new
        {
            EventId = eventId,
            EventName = eventInfo.Name,
            MaxTeams = eventInfo.NumberOfTeams,
            RegisteredTeams = confirmedCount,
            AvailableSpots = availableSpots,
            RegistrationOpen = registrationOpen,
            Status = registrationOpen ? "Open for Registration" : "Registration Full"
        });
    }

    /// <summary>
    /// AI Tool: Register a team through the agent
    /// </summary>
    [HttpPost("register-team")]
    public async Task<IActionResult> RegisterTeamForAgent([FromBody] RegisterTeamForAgentRequest request)
    {
        try
        {
            // First, create/get the team (no division at team level)
            var teamRequest = new CreateTeamRequest(
                request.TeamName,
                request.SchoolName,
                request.CoachName,
                request.CoachPhone,
                request.CoachEmail,
                request.AgeGroup
            );
            
            var team = await teamService.CreateAsync(teamRequest);

            // Then register for the event (division specified here)
            var registrationRequest = new CreateRegistrationRequest(
                request.EventId,
                team.Id,
                request.AgeGroup,
                request.Division
            );

            var registration = await registrationService.CreateAsync(registrationRequest);

            return Ok(new
            {
                Success = true,
                Message = $"Team '{request.TeamName}' successfully registered for the event",
                TeamId = team.Id,
                RegistrationId = registration.Id,
                Status = registration.Status,
                Team = new
                {
                    team.Name,
                    team.SchoolName,
                    team.CoachName,
                    team.AgeGroup
                },
                Registration = new
                {
                    registration.Division,
                    registration.AgeGroup
                }
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Success = false, Message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Success = false, Message = ex.Message });
        }
    }

    /// <summary>
    /// AI Tool: Generate fixtures for an event
    /// </summary>
    [HttpPost("events/{eventId}/generate-fixtures")]
    public async Task<IActionResult> GenerateFixturesForAgent(int eventId, [FromBody] GenerateFixturesForAgentRequest request)
    {
        try
        {
            var generateRequest = new GenerateFixturesRequest(eventId, request.PitchId);
            var fixtures = await fixtureService.GenerateAsync(generateRequest);

            return Ok(new
            {
                Success = true,
                Message = $"Generated {fixtures.Count} fixtures",
                FixtureCount = fixtures.Count,
                Fixtures = fixtures.Select(f => new
                {
                    f.Id,
                    f.KickOffTime,
                    HomeTeam = f.HomeTeamName,
                    AwayTeam = f.AwayTeamName,
                    f.PitchId,
                    f.AgeGroup,
                    f.Division,
                    Group = $"{f.AgeGroup}-{f.Division}"
                })
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Success = false, Message = ex.Message });
        }
    }

    /// <summary>
    /// AI Tool: Get team's fixture information
    /// </summary>
    [HttpGet("teams/{teamId}/fixtures")]
    public async Task<IActionResult> GetTeamFixtures(int teamId, int eventId)
    {
        var fixtures = await fixtureService.GetByEventAsync(eventId);
        var teamFixtures = fixtures.Where(f => f.HomeTeamId == teamId || f.AwayTeamId == teamId).ToList();

        return Ok(new
        {
            TeamId = teamId,
            EventId = eventId,
            FixtureCount = teamFixtures.Count,
            Fixtures = teamFixtures.Select(f => new
            {
                f.Id,
                f.KickOffTime,
                Opponent = f.HomeTeamId == teamId ? f.AwayTeamName : f.HomeTeamName,
                IsHomeGame = f.HomeTeamId == teamId,
                Venue = f.HomeTeamId == teamId ? "Home" : "Away",
                f.PitchId,
                f.Status,
                f.AgeGroup,
                f.Division,
                Group = $"{f.AgeGroup}-{f.Division}",
                // Include full details for reference
                Details = new
                {
                    HomeTeam = f.HomeTeamName,
                    AwayTeam = f.AwayTeamName
                }
            })
        });
    }

    /// <summary>
    /// AI Tool: Check if team can register (capacity check)
    /// </summary>
    [HttpGet("events/{eventId}/can-register")]
    public async Task<IActionResult> CanRegisterForEvent(int eventId)
    {
        try
        {
            var eventInfo = await eventService.GetAsync(eventId);
            if (eventInfo == null) 
                return NotFound($"Event {eventId} not found");

            // Get actual registration count
            var registrations = await registrationService.GetByEventAsync(eventId);
            var confirmedCount = registrations.Count(r => r.Status == "Confirmed");
            var availableSpots = eventInfo.NumberOfTeams - confirmedCount;
            var canRegister = confirmedCount < eventInfo.NumberOfTeams;

            return Ok(new
            {
                EventId = eventId,
                CanRegister = canRegister,
                AvailableSpots = availableSpots,
                RegisteredTeams = confirmedCount,
                MaxTeams = eventInfo.NumberOfTeams,
                Message = canRegister 
                    ? $"Registration is open. {availableSpots} spots remaining."
                    : "Registration is full. Event has reached maximum capacity."
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                EventId = eventId,
                CanRegister = false,
                AvailableSpots = 0,
                Message = ex.Message
            });
        }
    }
}

// DTOs for agent tools
public record CreateEventForAgentRequest(
    string Name,
    string Venue,
    string StartDate,
    string EndDate,
    string StartTime,
    string EndTime,
    int NumberOfTeams,
    string PitchStartTime,
    string PitchEndTime,
    string Description = "",
    string AgeGroups = "U13, U15",
    string EventType = "School Football Festival",
    int MatchDurationMinutes = 60,
    int BreakBetweenMatchesMinutes = 15,
    int MaxMatchesPerTeam = 3,
    int MinRestTimeBetweenMatches = 60
);

public record RegisterTeamForAgentRequest(
    int EventId,
    string TeamName,
    string SchoolName,
    string CoachName,
    string CoachPhone,
    string CoachEmail,
    string AgeGroup,
    string Division = ""
);

public record GenerateFixturesForAgentRequest(
    int PitchId
);