using Microsoft.AspNetCore.Mvc;
using SportHub.Application.DTOs;
using SportHub.Application.Services;

namespace SportHub.API.Controllers;

[ApiController]
[Route("[controller]")]
public class EventsController(EventService eventService) : ControllerBase
{
    [HttpGet]
    public Task<List<EventResponse>> List() => eventService.ListAsync();

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var ev = await eventService.GetAsync(id);
        return ev is null ? NotFound() : Ok(ev);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateEventRequest request)
    {
        try
        {
            var ev = await eventService.CreateAsync(request);
            return CreatedAtAction(nameof(Get), new { id = ev.Id }, ev);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateEventRequest request)
    {
        try
        {
            var ev = await eventService.UpdateAsync(id, request);
            return ev is null ? NotFound() : Ok(ev);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await eventService.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
