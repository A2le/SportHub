using Microsoft.AspNetCore.Mvc;
using SportHub.Application.DTOs;
using SportHub.Application.Services;

namespace SportHub.API.Controllers;

[ApiController]
[Route("[controller]")]
public class RegistrationsController(RegistrationService registrationService) : ControllerBase
{
    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var reg = await registrationService.GetAsync(id);
        return reg is null ? NotFound() : Ok(reg);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateRegistrationRequest request)
    {
        try
        {
            var reg = await registrationService.CreateAsync(request);
            return CreatedAtAction(nameof(Get), new { id = reg.Id }, reg);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("event/{eventId:int}")]
    public async Task<IActionResult> GetByEvent(int eventId)
    {
        var registrations = await registrationService.GetByEventAsync(eventId);
        return Ok(registrations);
    }
}
