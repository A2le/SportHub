namespace SportHub.Application.DTOs;

public record CreateRegistrationRequest(
    int EventId,
    int TeamId);

public record RegistrationResponse(
    int Id,
    int EventId,
    int TeamId,
    string Status,
    DateTime RegisteredAt);
