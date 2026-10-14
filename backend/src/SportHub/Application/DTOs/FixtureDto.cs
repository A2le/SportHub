namespace SportHub.Application.DTOs;

public record GenerateFixturesRequest(
    int EventId,
    int PitchId);

public record CreateFixtureRequest(
    int EventId,
    int HomeTeamId,
    int AwayTeamId,
    int PitchId,
    string KickOffTime);

public record FixtureResponse(
    int Id,
    int EventId,
    int HomeTeamId,
    string HomeTeamName,
    int AwayTeamId,
    string AwayTeamName,
    int PitchId,
    string KickOffTime,
    string Status,
    string AgeGroup,
    string Division);
