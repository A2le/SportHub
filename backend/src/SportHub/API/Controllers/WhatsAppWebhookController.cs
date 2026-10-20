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
            // For now, return a simple response while we fix authentication
            _logger.LogInformation("Processing message: {Message}", userMessage);
            
            return $"Hello! I received your message: '{userMessage}'. I'm the SportHub AI assistant. " +
                   "I can help you register teams for tournaments. " +
                   "(Note: Full AI integration is being configured)";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing message");
            return "I'm having trouble right now. Please try again.";
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
