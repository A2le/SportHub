using Microsoft.AspNetCore.Mvc;
using Amazon.BedrockAgentRuntime;
using Amazon.BedrockAgentRuntime.Model;
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
            var gatewayUrl = _configuration["AWS:BedrockGatewayUrl"] 
                ?? "https://sporthub-api-gateway-wzzk4w6ikw.gateway.bedrock-agentcore.eu-west-1.amazonaws.com/mcp";

            var httpClient = _httpClientFactory.CreateClient();
            
            // Create session ID from phone number (remove special characters)
            var sessionId = userId.Replace("whatsapp:", "").Replace("+", "").Replace(" ", "");
            
            // Prepare request payload for API Gateway
            var requestPayload = new
            {
                method = "call_tool",
                @params = new
                {
                    name = "ask_question",
                    arguments = new
                    {
                        question = userMessage,
                        session_id = sessionId
                    }
                }
            };

            var jsonContent = JsonSerializer.Serialize(requestPayload);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            _logger.LogInformation("Calling Bedrock Gateway: {Url}", gatewayUrl);
            
            var response = await httpClient.PostAsync(gatewayUrl, content);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Bedrock Gateway error: {StatusCode} - {Error}", response.StatusCode, errorContent);
                return "I'm having trouble connecting to my AI service. Please try again in a moment.";
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            _logger.LogInformation("Bedrock Gateway response: {Response}", responseBody);

            // Parse response - adjust based on actual API Gateway response format
            var responseJson = JsonDocument.Parse(responseBody);
            
            // Try to extract the text response - format may vary
            if (responseJson.RootElement.TryGetProperty("content", out var contentArray))
            {
                if (contentArray.GetArrayLength() > 0)
                {
                    var firstContent = contentArray[0];
                    if (firstContent.TryGetProperty("text", out var textElement))
                    {
                        return textElement.GetString() ?? "Sorry, I couldn't generate a response.";
                    }
                }
            }
            
            // Fallback: return raw response if we can't parse it
            return responseBody;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error invoking Bedrock gateway");
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
