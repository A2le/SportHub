namespace SportHub.Domain.Entities;

public class AgeGroup
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int MinAge { get; set; }
    public int MaxAge { get; set; }
}
