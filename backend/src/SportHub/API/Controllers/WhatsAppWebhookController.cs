using Microsoft.AspNetCore.Mvc;
using Amazon.BedrockAgentRuntime;
using Amazon.BedrockAgentRuntime.Model;
using SportHub.Application.Services;
using System.Text;

namespace SportHub.API.Controllers;

[ApiController]
[Route("api/whatsapp")]
public class WhatsAppWebhookController : ControllerBase
{
    private readonly IAmazonBedrockAgentRuntime _bedrockRuntime;
    private readonly TwilioWhatsAppService _whatsappService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<WhatsAppWebhookController> _logger;

    public WhatsAppWebhookController(
        IAmazonBedrockAgentRuntime bedrockRuntime,
        TwilioWhatsAppService whatsappService,
        IConfiguration configuration,
        ILogger<WhatsAppWebhookController> logger)
    {
        _bedrockRuntime = bedrockRuntime;
        _whatsappService = whatsappService;
        _configuration = configuration;
        _logger = logger;
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
            var fromNumber = request.From;
            var userMessage = request.Body;

            if (string.IsNullOrWhiteSpace(userMessage))
            {
                return Ok(); // Ignore empty messages
            }

            // Call Bedrock agent with the user's message
            var agentResponse = await InvokeBedrockAgentAsync(userMessage, request.From);

            // Send response back via WhatsApp
            await _whatsappService.SendMessageAsync(fromNumber, agentResponse);

            _logger.LogInformation("Sent response to {From}", fromNumber);

            // Return TwiML response (empty is fine, we already sent the message)
            return Content("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>", "application/xml");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing WhatsApp webhook");
            
            // Try to send error message to user
            try
            {
                await _whatsappService.SendMessageAsync(
                    request.From, 
                    "Sorry, I encountered an error processing your request. Please try again later.");
            }
            catch { /* Ignore if error notification fails */ }

            return Content("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>", "application/xml");
        }
    }

    private async Task<string> InvokeBedrockAgentAsync(string userMessage, string userId)
    {
        try
        {
            var agentId = _configuration["AWS:BedrockAgentId"] 
                ?? throw new InvalidOperationException("AWS:BedrockAgentId not configured");
            var agentAliasId = _configuration["AWS:BedrockAgentAliasId"] ?? "TSTALIASID";

            var request = new InvokeAgentRequest
            {
                AgentId = agentId,
                AgentAliasId = agentAliasId,
                SessionId = userId.Replace("whatsapp:", "").Replace("+", ""), // Use phone as session ID
                InputText = userMessage
            };

            var response = await _bedrockRuntime.InvokeAgentAsync(request);

            // Process the streaming response
            var fullResponse = new StringBuilder();
            
            await foreach (var payloadPart in response.Completion)
            {
                if (payloadPart.Chunk != null)
                {
                    var chunkText = Encoding.UTF8.GetString(payloadPart.Chunk.Bytes.ToArray());
                    fullResponse.Append(chunkText);
                }
            }

            var result = fullResponse.ToString();
            
            if (string.IsNullOrWhiteSpace(result))
            {
                return "I received your message but couldn't generate a response. Please try rephrasing your question.";
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error invoking Bedrock agent");
            return "I'm having trouble processing your request right now. Please try again in a moment.";
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
