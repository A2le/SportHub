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
                request.MatchDurationMinutes,
                request.BreakBetweenMatchesMinutes
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

        // Get registrations count (you'll need to implement this)
        // For now, return mock data
        return Ok(new
        {
            EventId = eventId,
            EventName = eventInfo.Name,
            MaxTeams = eventInfo.NumberOfTeams,
            RegisteredTeams = 0, // TODO: Get actual count
            AvailableSpots = eventInfo.NumberOfTeams,
            RegistrationOpen = true
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
                HomeTeam = f.HomeTeamName,
                AwayTeam = f.AwayTeamName,
                Opponent = f.HomeTeamId == teamId ? f.AwayTeamName : f.HomeTeamName,
                f.PitchId,
                f.Status,
                f.AgeGroup,
                f.Division,
                Group = $"{f.AgeGroup}-{f.Division}"
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
            // This will throw if capacity is reached
            var eventInfo = await eventService.GetAsync(eventId);
            if (eventInfo == null) 
                return NotFound($"Event {eventId} not found");

            // TODO: Implement actual capacity check
            return Ok(new
            {
                EventId = eventId,
                CanRegister = true,
                AvailableSpots = eventInfo.NumberOfTeams,
                Message = "Registration is open"
            });
        }
        catch (InvalidOperationException ex)
        {
            return Ok(new
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
    int BreakBetweenMatchesMinutes = 15
);

public record RegisterTeamForAgentRequest(
    int EventId,
    string TeamName,
    string SchoolName,
    string CoachName,
    string CoachPhone,
    string AgeGroup,
    string Division = ""
);

public record GenerateFixturesForAgentRequest(
    int PitchId
);

public record GenerateFixturesWithDivisionsRequest(
    int PitchId
);