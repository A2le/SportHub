namespace SportHub.Domain.Entities;

public class Fixture
{
    public int Id { get; set; }
    public int EventId { get; set; }
    public int HomeTeamId { get; set; }
    public int AwayTeamId { get; set; }
    public int PitchId { get; set; }
    public string KickOffTime { get; set; } = string.Empty;
    public string Status { get; set; } = "Scheduled";
}
