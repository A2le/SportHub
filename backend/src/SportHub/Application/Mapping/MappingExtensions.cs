using AutoMapper;
using SportHub.Application.DTOs;
using SportHub.Domain.Entities;

namespace SportHub.Application.Mapping;

public class EventProfile : Profile
{
    public EventProfile()
    {
        CreateMap<Event, EventResponse>();
        CreateMap<CreateEventRequest, Event>();
    }
}

public class TeamProfile : Profile
{
    public TeamProfile()
    {
        CreateMap<Team, TeamResponse>();
        CreateMap<CreateTeamRequest, Team>();
    }
}

public class FixtureProfile : Profile
{
    public FixtureProfile()
    {
        CreateMap<Fixture, FixtureResponse>();
    }
}

public class RegistrationProfile : Profile
{
    public RegistrationProfile()
    {
        CreateMap<Registration, RegistrationResponse>();
    }
}
