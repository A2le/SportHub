using AutoMapper;
using SportHub.Application.DTOs;
using SportHub.Application.Interfaces;
using SportHub.Domain.Entities;

namespace SportHub.Application.Services;

public class FixtureService(IFixtureRepository fixtures, IRegistrationRepository registrations, IMapper mapper)
{
    public async Task<List<FixtureResponse>> GetByEventAsync(int eventId)
        => mapper.Map<List<FixtureResponse>>(await fixtures.GetByEventIdAsync(eventId));

    public async Task<List<FixtureResponse>> GenerateAsync(GenerateFixturesRequest request)
    {
        var regs = await registrations.GetByEventIdAsync(request.EventId);
        var teamIds = regs.Where(r => r.Status == "Confirmed").Select(r => r.TeamId).ToList();

        var generated = new List<Fixture>();
        var slot = request.StartDate;

        for (int i = 0; i < teamIds.Count; i++)
        for (int j = i + 1; j < teamIds.Count; j++)
        {
            var fixture = new Fixture
            {
                EventId = request.EventId,
                HomeTeamId = teamIds[i],
                AwayTeamId = teamIds[j],
                PitchId = request.PitchId,
                ScheduledAt = slot
            };
            await fixtures.SaveAsync(fixture);
            generated.Add(fixture);
            slot = slot.AddHours(1.5);
        }

        return mapper.Map<List<FixtureResponse>>(generated);
    }
}
