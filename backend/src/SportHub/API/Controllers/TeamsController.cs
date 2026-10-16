using Microsoft.AspNetCore.Mvc;
using SportHub.Application.DTOs;
using SportHub.Application.Services;

namespace SportHub.API.Controllers;

[ApiController]
[Route("[controller]")]
public class TeamsController(TeamService teamService) : ControllerBase
{
    [HttpGet]
    public Task<List<TeamResponse>> List() => teamService.ListAsync();

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var team = await teamService.GetAsync(id);
        return team is null ? NotFound() : Ok(team);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateTeamRequest request)
    {
        var team = await teamService.CreateAsync(request);
        return CreatedAtAction(nameof(Get), new { id = team.Id }, team);
    }
}
