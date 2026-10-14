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
        // Check for duplicate team names in the same school and age group
        var existingTeams = await teams.GetAllAsync();
        var duplicateTeam = existingTeams.FirstOrDefault(t => 
            t.Name.Equals(request.Name, StringComparison.OrdinalIgnoreCase) && 
            t.SchoolName.Equals(request.SchoolName, StringComparison.OrdinalIgnoreCase) &&
            t.AgeGroup.Equals(request.AgeGroup, StringComparison.OrdinalIgnoreCase));
            
        if (duplicateTeam != null)
        {
            throw new InvalidOperationException($"Team '{request.Name}' from '{request.SchoolName}' in age group '{request.AgeGroup}' already exists");
        }

        var team = mapper.Map<Team>(request);
        await teams.SaveAsync(team);
        return mapper.Map<TeamResponse>(team);
    }
}
