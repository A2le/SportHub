namespace SportHub.Application.DTOs;

public record GenerateFixturesRequest(
    int EventId,
    int PitchId,
    DateTime StartDate);

public record FixtureResponse(
    int Id,
    int EventId,
    int HomeTeamId,
    int AwayTeamId,
    int PitchId,
    DateTime ScheduledAt,
    string Status);
