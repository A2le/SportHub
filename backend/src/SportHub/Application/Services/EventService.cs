using AutoMapper;
using SportHub.Application.DTOs;
using SportHub.Application.Interfaces;
using SportHub.Domain.Entities;

namespace SportHub.Application.Services;

public class EventService(IEventRepository events, IMapper mapper)
{
    public async Task<EventResponse?> GetAsync(int id)
    {
        var ev = await events.GetByIdAsync(id);
        return ev is null ? null : mapper.Map<EventResponse>(ev);
    }

    public async Task<List<EventResponse>> ListAsync()
        => mapper.Map<List<EventResponse>>(await events.GetAllAsync());

    public async Task<EventResponse> CreateAsync(CreateEventRequest request)
    {
        var ev = mapper.Map<Event>(request);
        await events.SaveAsync(ev);
        return mapper.Map<EventResponse>(ev);
    }

    public async Task<EventResponse?> UpdateAsync(int id, UpdateEventRequest request)
    {
        var ev = await events.GetByIdAsync(id);
        if (ev is null) return null;
        if (request.Name is not null) ev.Name = request.Name;
        if (request.Venue is not null) ev.Venue = request.Venue;
        if (request.StartDate is not null) ev.StartDate = request.StartDate;
        if (request.EndDate is not null) ev.EndDate = request.EndDate;
        if (request.StartTime is not null) ev.StartTime = request.StartTime;
        if (request.EndTime is not null) ev.EndTime = request.EndTime;
        if (request.NumberOfTeams is not null) ev.NumberOfTeams = request.NumberOfTeams.Value;
        if (request.NumberOfPitches is not null) ev.NumberOfPitches = request.NumberOfPitches.Value;
        if (request.PitchStartTime is not null) ev.PitchStartTime = request.PitchStartTime;
        if (request.PitchEndTime is not null) ev.PitchEndTime = request.PitchEndTime;
        if (request.Description is not null) ev.Description = request.Description;
        if (request.AgeGroups is not null) ev.AgeGroups = request.AgeGroups;
        if (request.EventType is not null) ev.EventType = request.EventType;
        if (request.MatchDurationMinutes is not null) ev.MatchDurationMinutes = request.MatchDurationMinutes.Value;
        if (request.BreakBetweenMatchesMinutes is not null) ev.BreakBetweenMatchesMinutes = request.BreakBetweenMatchesMinutes.Value;
        await events.UpdateAsync(id, ev);
        return mapper.Map<EventResponse>(ev);
    }

    public async Task<bool> DeleteAsync(int id) => await events.DeleteAsync(id);
}
