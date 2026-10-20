using Microsoft.AspNetCore.Mvc;
using SportHub.Application.Services;
using System.Text;
using System.Text.Json;

namespace SportHub.API.Controllers;

[ApiController]
[Route("api/whatsapp")]
public class WhatsAppWebhookController : ControllerBase
{
    private readonly TwilioWhatsAppService _whatsappService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<WhatsAppWebhookController> _logger;
    private readonly IHttpClientFactory _httpClientFactory;

    public WhatsAppWebhookController(
        TwilioWhatsAppService whatsappService,
        IConfiguration configuration,
        ILogger<WhatsAppWebhookController> logger,
        IHttpClientFactory httpClientFactory)
    {
        _whatsappService = whatsappService;
        _configuration = configuration;
        _logger = logger;
        _httpClientFactory = httpClientFactory;
    }

    [HttpPost("webhook")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> ReceiveMessage([FromForm] TwilioWebhookRequest request)
    {
        try
        {
            _logger.LogInformation("Received WhatsApp message from {From}: {Body}", 
                request.From, request.Body);

            // Extract phone number and message
            var userMessage = request.Body;

            if (string.IsNullOrWhiteSpace(userMessage))
            {
                return Content("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>", "application/xml");
            }

            // Call Bedrock agent with the user's message
            var agentResponse = await InvokeBedrockAgentAsync(userMessage, request.From);

            // Return TwiML response directly (this way we don't need to send a separate message)
            var twimlResponse = $@"<?xml version=""1.0"" encoding=""UTF-8""?>
<Response>
    <Message>{System.Security.SecurityElement.Escape(agentResponse)}</Message>
</Response>";

            _logger.LogInformation("Sending response to {From}", request.From);

            return Content(twimlResponse, "application/xml");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing WhatsApp webhook");
            
            var errorResponse = @"<?xml version=""1.0"" encoding=""UTF-8""?>
<Response>
    <Message>Sorry, I encountered an error. Please try again later.</Message>
</Response>";

            return Content(errorResponse, "application/xml");
        }
    }

    private async Task<string> InvokeBedrockAgentAsync(string userMessage, string userId)
    {
        try
        {
            _logger.LogInformation("Processing message: {Message}", userMessage);
            
            // Simple keyword-based routing to demonstrate the integration
            var messageLower = userMessage.ToLower();
            
            if (messageLower.Contains("register") || messageLower.Contains("sign up") || messageLower.Contains("join"))
            {
                // Get available events
                var events = await GetAvailableEventsAsync();
                if (events.Any())
                {
                    var eventList = string.Join("\n", events.Select((e, i) => $"{i + 1}. {e.Name} - {e.Sport} ({e.StartDate:MMM dd})"));
                    return $"Great! I can help you register your team. Here are the available tournaments:\n\n{eventList}\n\nPlease reply with the event name you want to register for.";
                }
                return "I'm ready to help you register! However, there are no active events right now. Please check back later.";
            }
            else if (messageLower.Contains("event") || messageLower.Contains("tournament"))
            {
                var events = await GetAvailableEventsAsync();
                if (events.Any())
                {
                    var eventList = string.Join("\n", events.Select(e => $"• {e.Name} - {e.Sport} on {e.StartDate:MMM dd, yyyy}"));
                    return $"📅 Here are the upcoming tournaments:\n\n{eventList}\n\nWould you like to register your team for any of these?";
                }
                return "There are no active tournaments at the moment. Check back soon!";
            }
            else if (messageLower.Contains("help") || messageLower.Contains("hi") || messageLower.Contains("hello"))
            {
                return "👋 Welcome to SportHub! I'm your AI tournament assistant.\n\n" +
                       "I can help you:\n" +
                       "• Register teams for tournaments\n" +
                       "• View available events\n" +
                       "• Check fixtures and schedules\n\n" +
                       "Just tell me what you need!";
            }
            else
            {
                return $"I received: '{userMessage}'\n\n" +
                       "I can help you register teams for tournaments. Try saying:\n" +
                       "• 'I want to register my team'\n" +
                       "• 'Show me available events'\n" +
                       "• 'Help'";
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing message");
            return "I'm having trouble right now. Please try again.";
        }
    }

    private async Task<List<EventInfo>> GetAvailableEventsAsync()
    {
        try
        {
            var httpClient = _httpClientFactory.CreateClient();
            var apiUrl = _configuration["API:BaseUrl"] ?? "https://sporthub-rng4.onrender.com";
            
            var response = await httpClient.GetAsync($"{apiUrl}/Events");
            
            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadAsStringAsync();
                var events = JsonSerializer.Deserialize<List<EventInfo>>(json, new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true 
                });
                
                // Only return future events
                return events?.Where(e => e.StartDate >= DateTime.Today).ToList() ?? new List<EventInfo>();
            }
            
            return new List<EventInfo>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching events");
            return new List<EventInfo>();
        }
    }

    [HttpGet("webhook")]
    public IActionResult VerifyWebhook()
    {
        // Twilio doesn't require webhook verification like some platforms,
        // but this endpoint can be used for testing
        return Ok(new { status = "Webhook endpoint is active", timestamp = DateTime.UtcNow });
    }
}

// Model for Twilio webhook form data
public class TwilioWebhookRequest
{
    public string MessageSid { get; set; } = string.Empty;
    public string AccountSid { get; set; } = string.Empty;
    public string From { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public int NumMedia { get; set; }
    public string ProfileName { get; set; } = string.Empty;
}

public class EventInfo
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Sport { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}
