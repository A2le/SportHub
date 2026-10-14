namespace SportHub.Domain.Entities;

public class Registration
{
    public int Id { get; set; }
    public int EventId { get; set; }
    public int TeamId { get; set; }
    public string AgeGroup { get; set; } = string.Empty;
    public string Division { get; set; } = string.Empty;
    public string Status { get; set; } = "Confirmed";
    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
}
