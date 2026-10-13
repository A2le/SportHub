namespace SportHub.Domain.Entities;

public class Team
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string SchoolName { get; set; } = string.Empty;
    public string CoachName { get; set; } = string.Empty;
    public string CoachPhone { get; set; } = string.Empty;
    public string AgeGroup { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
