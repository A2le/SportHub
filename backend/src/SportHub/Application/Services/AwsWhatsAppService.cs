using Amazon.SocialMessaging;
using Amazon.SocialMessaging.Model;
using Microsoft.Extensions.Logging;

namespace SportHub.Application.Services;

public class AwsWhatsAppService
{
    private readonly IAmazonSocialMessaging _socialMessaging;
    private readonly ILogger<AwsWhatsAppService> _logger;
    private readonly IConfiguration _configuration;

    public AwsWhatsAppService(
        IAmazonSocialMessaging socialMessaging,
        ILogger<AwsWhatsAppService> logger,
        IConfiguration configuration)
    {
        _socialMessaging = socialMessaging;
        _logger = logger;
        _configuration = configuration;
    }

    public async Task<bool> SendMessageAsync(string toPhoneNumber, string message)
    {
        try
        {
            var phoneNumberId = _configuration["AWS:WhatsAppPhoneNumberId"];
            
            if (string.IsNullOrEmpty(phoneNumberId))
            {
                _logger.LogError("WhatsApp Phone Number ID not configured");
                return false;
            }

            // Format phone number (remove 'whatsapp:' prefix if present)
            var cleanNumber = toPhoneNumber.Replace("whatsapp:", "").Trim();

            // Create the WhatsApp message payload
            var messagePayload = System.Text.Json.JsonSerializer.Serialize(new
            {
                messaging_product = "whatsapp",
                to = cleanNumber,
                type = "text",
                text = new { body = message }
            });

            var messageBytes = System.Text.Encoding.UTF8.GetBytes(messagePayload);
            var messageStream = new MemoryStream(messageBytes);

            var request = new SendWhatsAppMessageRequest
            {
                OriginationPhoneNumberId = phoneNumberId,
                Message = messageStream,
                MetaApiVersion = "v20.0"
            };

            var response = await _socialMessaging.SendWhatsAppMessageAsync(request);
            
            _logger.LogInformation("WhatsApp message sent successfully. MessageId: {MessageId}", 
                response.MessageId);
            
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending WhatsApp message to {Phone}", toPhoneNumber);
            return false;
        }
    }
}
