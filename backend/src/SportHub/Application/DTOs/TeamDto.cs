namespace SportHub.Application.DTOs;

public record CreateTeamRequest(
    string Name,
    string SchoolName,
    string CoachName,
    string CoachPhone,
    string CoachEmail,
    string AgeGroup);

public record TeamResponse(
    int Id,
    string Name,
    string SchoolName,
    string CoachName,
    string CoachPhone,
    string CoachEmail,
    string AgeGroup,
    DateTime CreatedAt);
