namespace SportHub.Domain.Entities;

public class Event
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string EventType { get; set; } = "School Football Festival";
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
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("o");
}
