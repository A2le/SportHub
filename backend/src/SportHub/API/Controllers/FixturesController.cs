using Microsoft.AspNetCore.Mvc;
using SportHub.Application.DTOs;
using SportHub.Application.Services;

namespace SportHub.API.Controllers;

[ApiController]
[Route("[controller]")]
public class FixturesController(FixtureService fixtureService) : ControllerBase
{
    [HttpGet("{eventId:int}")]
    public Task<List<FixtureResponse>> GetByEvent(int eventId)
        => fixtureService.GetByEventAsync(eventId);

    [HttpPost("generate")]
    public async Task<IActionResult> Generate(GenerateFixturesRequest request)
        => Ok(await fixtureService.GenerateAsync(request));
}
