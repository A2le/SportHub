namespace SportHub.Domain.Entities;

public class Registration
{
    public int Id { get; set; }
    public int EventId { get; set; }
    public int TeamId { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
}
