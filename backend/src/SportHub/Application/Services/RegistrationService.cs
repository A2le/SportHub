using AutoMapper;
using SportHub.Application.DTOs;
using SportHub.Application.Interfaces;
using SportHub.Domain.Entities;

namespace SportHub.Application.Services;

public class RegistrationService(IRegistrationRepository registrations, INotificationRepository notifications, IMapper mapper)
{
    public async Task<RegistrationResponse?> GetAsync(int id)
    {
        var reg = await registrations.GetByIdAsync(id);
        return reg is null ? null : mapper.Map<RegistrationResponse>(reg);
    }

    public async Task<RegistrationResponse> CreateAsync(CreateRegistrationRequest request)
    {
        var reg = new Registration { EventId = request.EventId, TeamId = request.TeamId };
        await registrations.SaveAsync(reg);

        await notifications.SaveAsync(new Notification
        {
            RecipientId = request.TeamId,
            Message = $"Registration submitted for event {request.EventId}",
            Type = "Push"
        });

        return mapper.Map<RegistrationResponse>(reg);
    }
}
