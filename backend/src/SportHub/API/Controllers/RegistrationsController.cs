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
        var reg = await registrationService.CreateAsync(request);
        return CreatedAtAction(nameof(Get), new { id = reg.Id }, reg);
    }
}
