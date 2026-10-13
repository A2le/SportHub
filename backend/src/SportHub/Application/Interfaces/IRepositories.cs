using SportHub.Domain.Entities;

namespace SportHub.Application.Interfaces;

public interface IEventRepository
{
    Task<Event?> GetByIdAsync(int id);
    Task<List<Event>> GetAllAsync();
    Task SaveAsync(Event ev);
    Task<bool> UpdateAsync(int id, Event ev);
    Task<bool> DeleteAsync(int id);
}

public interface ITeamRepository
{
    Task<Team?> GetByIdAsync(int id);
    Task<List<Team>> GetAllAsync();
    Task SaveAsync(Team team);
}

public interface IRegistrationRepository
{
    Task<Registration?> GetByIdAsync(int id);
    Task<List<Registration>> GetByEventIdAsync(int eventId);
    Task SaveAsync(Registration registration);
}

public interface IFixtureRepository
{
    Task<List<Fixture>> GetByEventIdAsync(int eventId);
    Task SaveAsync(Fixture fixture);
}

public interface INotificationRepository
{
    Task SaveAsync(Notification notification);
}
