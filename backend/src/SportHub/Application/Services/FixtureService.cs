using System.Globalization;
using AutoMapper;
using SportHub.Application.DTOs;
using SportHub.Application.Interfaces;
using SportHub.Domain.Entities;

namespace SportHub.Application.Services;

public class FixtureService(IFixtureRepository fixtures, IRegistrationRepository registrations, IEventRepository events, ITeamRepository teams)
{
    public async Task<List<FixtureResponse>> GetByEventAsync(int eventId)
    {
        var fixtureList = await fixtures.GetByEventIdAsync(eventId);
        var teamList = await teams.GetAllAsync();
        var registrationList = await registrations.GetByEventIdAsync(eventId);
        
        return fixtureList.Select(f => ToResponse(f, teamList, registrationList)).ToList();
    }

    public async Task<List<FixtureResponse>> GenerateAsync(GenerateFixturesRequest request)
    {
        var ev = await events.GetByIdAsync(request.EventId);
        if (ev is null) return [];

        var regs = await registrations.GetByEventIdAsync(request.EventId);
        var teamList = await teams.GetAllAsync();

        // Auto-assign divisions if not specified - create balanced divisions
        await AutoAssignDivisions(regs, request.EventId);
        
        // Reload registrations after auto-assignment
        regs = await registrations.GetByEventIdAsync(request.EventId);

        // Group teams by age group and division for fair matchmaking
        var teamsByAgeAndDivision = new Dictionary<string, List<int>>();
        foreach (var reg in regs.Where(r => r.Status == "Confirmed"))
        {
            var key = $"{reg.AgeGroup}-{reg.Division}";
            if (!teamsByAgeAndDivision.ContainsKey(key))
                teamsByAgeAndDivision[key] = new List<int>();
            teamsByAgeAndDivision[key].Add(reg.TeamId);
        }

        var generated = new List<Fixture>();
        var startMinutes = TimeSpan.Parse(ev.PitchStartTime, CultureInfo.InvariantCulture).TotalMinutes;
        var endMinutes = TimeSpan.Parse(ev.PitchEndTime, CultureInfo.InvariantCulture).TotalMinutes;
        var matchDuration = ev.MatchDurationMinutes;
        var breakDuration = ev.BreakBetweenMatchesMinutes;
        
        // Calculate total available time and split between age groups and divisions
        var totalTime = endMinutes - startMinutes;
        var timePerGroup = totalTime / teamsByAgeAndDivision.Count;

        var currentSlotStart = startMinutes;

        // Generate fixtures for each age group and division separately
        foreach (var (groupKey, teamIds) in teamsByAgeAndDivision)
        {
            Console.WriteLine($"Generating fixtures for {groupKey}: {string.Join(", ", teamIds)}");
            
            // Each group gets its own time allocation
            var groupEndTime = currentSlotStart + timePerGroup;
            var slotMinutes = currentSlotStart;
            
            var fixtures = GenerateFairFixtures(teamIds, request.EventId, request.PitchId, ref slotMinutes, groupEndTime, matchDuration, breakDuration, groupKey);
            generated.AddRange(fixtures);
            
            // Next group starts after this one
            currentSlotStart = groupEndTime;
        }

        // Save all fixtures
        foreach (var fixture in generated)
        {
            await fixtures.SaveAsync(fixture);
        }

        return generated.Select(f => ToResponse(f, teamList, regs)).ToList();
    }

    private async Task AutoAssignDivisions(List<Registration> registrationList, int eventId)
    {
        // Group by age group first
        var regsByAgeGroup = registrationList
            .Where(r => string.IsNullOrEmpty(r.Division))
            .GroupBy(r => r.AgeGroup)
            .ToList();

        foreach (var ageGroupRegs in regsByAgeGroup)
        {
            var regsInAge = ageGroupRegs.ToList();
            
            // If we have enough teams for divisions (at least 6), create balanced divisions
            if (regsInAge.Count >= 6)
            {
                // Randomize order first for fair distribution
                var random = new Random();
                var shuffledRegs = regsInAge.OrderBy(x => random.Next()).ToList();
                
                var halfCount = shuffledRegs.Count / 2;
                
                // Assign Division A to first half, Division B to second half
                for (int i = 0; i < shuffledRegs.Count; i++)
                {
                    var reg = shuffledRegs[i];
                    reg.Division = i < halfCount ? "A" : "B";
                    await registrations.SaveAsync(reg);
                }
                
                Console.WriteLine($"Auto-assigned divisions for {ageGroupRegs.Key}: Division A ({halfCount} teams), Division B ({shuffledRegs.Count - halfCount} teams)");
            }
            else
            {
                // Too few teams for divisions, put all in Division A
                foreach (var reg in regsInAge)
                {
                    reg.Division = "A";
                    await registrations.SaveAsync(reg);
                }
                
                Console.WriteLine($"Auto-assigned all {regsInAge.Count} teams in {ageGroupRegs.Key} to Division A (not enough for two divisions)");
            }
        }
    }

    private List<Fixture> GenerateFairFixtures(List<int> teamIds, int eventId, int pitchId, ref double slotMinutes, double endMinutes, int matchDuration, int breakDuration, string groupKey)
    {
        var fixtures = new List<Fixture>();
        
        if (teamIds.Count < 2) 
        {
            Console.WriteLine($"Not enough teams for {groupKey}: {teamIds.Count}");
            return fixtures;
        }

        Console.WriteLine($"Creating fixtures for {groupKey} with {teamIds.Count} teams");

        // Create a fair round-robin schedule
        // Each team plays every other team exactly once
        var matchups = new List<(int home, int away)>();
        
        for (int i = 0; i < teamIds.Count; i++)
        {
            for (int j = i + 1; j < teamIds.Count; j++)
            {
                matchups.Add((teamIds[i], teamIds[j]));
            }
        }

        // Randomize the order of matches for variety
        var random = new Random();
        matchups = matchups.OrderBy(x => random.Next()).ToList();

        Console.WriteLine($"Generated {matchups.Count} matchups for {groupKey}");

        // Schedule matches within available time
        foreach (var (home, away) in matchups)
        {
            // Check if we have time for this match
            if (slotMinutes + matchDuration > endMinutes) 
            {
                Console.WriteLine($"No more time available at {slotMinutes} minutes");
                break;
            }

            var kickOff = TimeSpan.FromMinutes(slotMinutes).ToString(@"hh\:mm");

            var fixture = new Fixture
            {
                EventId = eventId,
                HomeTeamId = home,
                AwayTeamId = away,
                PitchId = pitchId,
                KickOffTime = kickOff
            };

            fixtures.Add(fixture);
            Console.WriteLine($"Added fixture: Team {home} vs Team {away} at {kickOff}");
            slotMinutes += matchDuration + breakDuration;
        }

        return fixtures;
    }

    public async Task<FixtureResponse?> CreateAsync(CreateFixtureRequest request)
    {
        // Validate fixture fits within pitch window
        var eventEntity = await events.GetByIdAsync(request.EventId);
        if (eventEntity == null)
            throw new ArgumentException($"Event with ID {request.EventId} not found");

        try
        {
            var kickOff = TimeSpan.Parse(request.KickOffTime, CultureInfo.InvariantCulture);
            var pitchStart = TimeSpan.Parse(eventEntity.PitchStartTime, CultureInfo.InvariantCulture);
            var pitchEnd = TimeSpan.Parse(eventEntity.PitchEndTime, CultureInfo.InvariantCulture);
            var matchEnd = kickOff.Add(TimeSpan.FromMinutes(eventEntity.MatchDurationMinutes));

            if (kickOff < pitchStart || matchEnd > pitchEnd)
            {
                throw new ArgumentException($"Fixture (kick-off: {request.KickOffTime}, duration: {eventEntity.MatchDurationMinutes}min) does not fit within pitch availability ({eventEntity.PitchStartTime} - {eventEntity.PitchEndTime})");
            }
        }
        catch (FormatException)
        {
            throw new ArgumentException($"Invalid kick-off time format: {request.KickOffTime}. Expected H:mm or HH:mm format (e.g., 8:00 or 08:00)");
        }

        var fixture = new Fixture
        {
            EventId = request.EventId,
            HomeTeamId = request.HomeTeamId,
            AwayTeamId = request.AwayTeamId,
            PitchId = request.PitchId,
            KickOffTime = request.KickOffTime
        };

        await fixtures.SaveAsync(fixture);
        var teamList = await teams.GetAllAsync();
        var eventRegistrations = await registrations.GetByEventIdAsync(request.EventId);
        return ToResponse(fixture, teamList, eventRegistrations);
    }

    private static FixtureResponse ToResponse(Fixture f, List<Team> teamList, List<Registration> registrationList)
    {
        // Find the registration for the home team to get division and age group info
        var homeTeamReg = registrationList.FirstOrDefault(r => r.TeamId == f.HomeTeamId);
        
        return new(
            f.Id,
            f.EventId,
            f.HomeTeamId,
            teamList.FirstOrDefault(t => t.Id == f.HomeTeamId)?.Name ?? "",
            f.AwayTeamId,
            teamList.FirstOrDefault(t => t.Id == f.AwayTeamId)?.Name ?? "",
            f.PitchId,
            f.KickOffTime,
            f.Status,
            homeTeamReg?.AgeGroup ?? "",
            homeTeamReg?.Division ?? ""
        );
    }
}
