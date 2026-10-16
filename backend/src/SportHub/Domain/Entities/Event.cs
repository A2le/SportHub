namespace SportHub.Domain.Entities;

public class Event
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string EventType { get; set; } = "School Football Festival";
    public string SportCategory { get; set; } = "Football"; // New: Football, Rugby, Cricket, etc.
    public string Venue { get; set; } = string.Empty;
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public int NumberOfTeams { get; set; }
    public string Description { get; set; } = string.Empty;
    public string AgeGroups { get; set; } = string.Empty;
    public string PitchStartTime { get; set; } = string.Empty;
    public string PitchEndTime { get; set; } = string.Empty;
    public int MatchDurationMinutes { get; set; } = 90;
    public int BreakBetweenMatchesMinutes { get; set; } = 10;
    public int MaxMatchesPerTeam { get; set; } = 3; // New: Maximum matches each team can play
    public int MinRestTimeBetweenMatches { get; set; } = 60; // New: Minimum rest time in minutes between team matches
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("o");
}
