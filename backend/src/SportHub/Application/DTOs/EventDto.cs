namespace SportHub.Application.DTOs;

public record CreateEventRequest(
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
    string AgeGroups = "",
    string EventType = "School Football Festival",
    int MatchDurationMinutes = 90,
    int BreakBetweenMatchesMinutes = 10);

public record UpdateEventRequest(
    string? Name,
    string? Venue,
    string? StartDate,
    string? EndDate,
    string? StartTime,
    string? EndTime,
    int? NumberOfTeams,
    string? PitchStartTime,
    string? PitchEndTime,
    string? Description,
    string? AgeGroups,
    string? EventType,
    int? MatchDurationMinutes,
    int? BreakBetweenMatchesMinutes);

public record EventResponse(
    int Id,
    string Name,
    string EventType,
    string Venue,
    string StartDate,
    string EndDate,
    string StartTime,
    string EndTime,
    int NumberOfTeams,
    string Description,
    string AgeGroups,
    string PitchStartTime,
    string PitchEndTime,
    int MatchDurationMinutes,
    int BreakBetweenMatchesMinutes,
    string CreatedAt);
