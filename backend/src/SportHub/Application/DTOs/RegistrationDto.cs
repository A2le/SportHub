namespace SportHub.Application.DTOs;

public record CreateRegistrationRequest(
    int EventId,
    int TeamId,
    string AgeGroup,
    string Division = "");

public record RegistrationResponse(
    int Id,
    int EventId,
    int TeamId,
    string TeamName,
    string AgeGroup,
    string Division,
    string Status,
    DateTime RegisteredAt);
