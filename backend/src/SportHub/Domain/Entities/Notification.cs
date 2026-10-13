namespace SportHub.Domain.Entities;

public class Notification
{
    public int Id { get; set; }
    public int RecipientId { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
