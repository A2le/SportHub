using AutoMapper;
using SportHub.Application.DTOs;
using SportHub.Application.Interfaces;
using SportHub.Domain.Entities;

namespace SportHub.Application.Services;

public class TeamService(ITeamRepository teams, IMapper mapper)
{
    public async Task<TeamResponse?> GetAsync(int id)
    {
        var team = await teams.GetByIdAsync(id);
        return team is null ? null : mapper.Map<TeamResponse>(team);
    }

    public async Task<List<TeamResponse>> ListAsync()
        => mapper.Map<List<TeamResponse>>(await teams.GetAllAsync());

    public async Task<TeamResponse> CreateAsync(CreateTeamRequest request)
    {
        var team = mapper.Map<Team>(request);
        await teams.SaveAsync(team);
        return mapper.Map<TeamResponse>(team);
    }
}
