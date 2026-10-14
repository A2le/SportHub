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
    {
        try
        {
            var fixtures = await fixtureService.GenerateAsync(request);
            return Ok(fixtures);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateFixtureRequest request)
    {
        try
        {
            var fixture = await fixtureService.CreateAsync(request);
            return Ok(fixture);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
