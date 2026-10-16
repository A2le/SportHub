using System.Globalization;
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
        
        // Validate pitch times are within event times
        if (!string.IsNullOrEmpty(ev.PitchStartTime) && !string.IsNullOrEmpty(ev.PitchEndTime) &&
            !string.IsNullOrEmpty(ev.StartTime) && !string.IsNullOrEmpty(ev.EndTime))
        {
            try
            {
                // Use flexible parsing that accepts both H:mm and HH:mm
                var eventStart = TimeSpan.Parse(ev.StartTime, CultureInfo.InvariantCulture);
                var eventEnd = TimeSpan.Parse(ev.EndTime, CultureInfo.InvariantCulture);
                var pitchStart = TimeSpan.Parse(ev.PitchStartTime, CultureInfo.InvariantCulture);
                var pitchEnd = TimeSpan.Parse(ev.PitchEndTime, CultureInfo.InvariantCulture);

                if (pitchStart < eventStart || pitchEnd > eventEnd)
                {
                    throw new ArgumentException("Pitch availability times must fall within event times");
                }
            }
            catch (FormatException)
            {
                throw new ArgumentException("Invalid time format. Expected H:mm or HH:mm format (e.g., 8:00 or 08:00)");
            }
        }
        
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
        if (request.PitchStartTime is not null) ev.PitchStartTime = request.PitchStartTime;
        if (request.PitchEndTime is not null) ev.PitchEndTime = request.PitchEndTime;
        if (request.Description is not null) ev.Description = request.Description;
        if (request.AgeGroups is not null) ev.AgeGroups = request.AgeGroups;
        if (request.EventType is not null) ev.EventType = request.EventType;
        if (request.SportCategory is not null) ev.SportCategory = request.SportCategory;
        if (request.MatchDurationMinutes is not null) ev.MatchDurationMinutes = request.MatchDurationMinutes.Value;
        if (request.BreakBetweenMatchesMinutes is not null) ev.BreakBetweenMatchesMinutes = request.BreakBetweenMatchesMinutes.Value;
        
        // Validate pitch times are within event times after updates
        if (!string.IsNullOrEmpty(ev.PitchStartTime) && !string.IsNullOrEmpty(ev.PitchEndTime) &&
            !string.IsNullOrEmpty(ev.StartTime) && !string.IsNullOrEmpty(ev.EndTime))
        {
            try
            {
                // Use flexible parsing that accepts both H:mm and HH:mm
                var eventStart = TimeSpan.Parse(ev.StartTime, CultureInfo.InvariantCulture);
                var eventEnd = TimeSpan.Parse(ev.EndTime, CultureInfo.InvariantCulture);
                var pitchStart = TimeSpan.Parse(ev.PitchStartTime, CultureInfo.InvariantCulture);
                var pitchEnd = TimeSpan.Parse(ev.PitchEndTime, CultureInfo.InvariantCulture);

                if (pitchStart < eventStart || pitchEnd > eventEnd)
                {
                    throw new ArgumentException("Pitch availability times must fall within event times");
                }
            }
            catch (FormatException)
            {
                throw new ArgumentException("Invalid time format. Expected H:mm or HH:mm format (e.g., 8:00 or 08:00)");
            }
        }
        
        await events.UpdateAsync(id, ev);
        return mapper.Map<EventResponse>(ev);
    }

    public async Task<bool> DeleteAsync(int id) => await events.DeleteAsync(id);
}
