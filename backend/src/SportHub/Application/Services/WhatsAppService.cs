using Microsoft.Extensions.Configuration;
using System.Net.Http.Json;
using System.Text.Json;

namespace SportHub.Application.Services;

public class WhatsAppService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly string _phoneNumberId;
    private readonly string _accessToken;
    private readonly string _apiVersion;

    public WhatsAppService(IConfiguration configuration)
    {
        _configuration = configuration;
        _httpClient = new HttpClient();
        _phoneNumberId = _configuration["WhatsApp:PhoneNumberId"] ?? "";
        _accessToken = _configuration["WhatsApp:AccessToken"] ?? "";
        _apiVersion = _configuration["WhatsApp:ApiVersion"] ?? "v21.0";
    }

    public async Task<bool> SendRegistrationConfirmationAsync(string phoneNumber, string teamName, string eventName, string coachName)
    {
        try
        {
            var message = $@"Hello {coachName}! 🏆

Your team *{teamName}* has been successfully registered for *{eventName}*!

We're excited to have you participate. You'll receive fixture details once the tournament schedule is generated.

Good luck! ⚽";

            return await SendMessageAsync(phoneNumber, message);
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> SendFixtureNotificationAsync(string phoneNumber, string teamName, string fixtureDetails)
    {
        try
        {
            var message = $@"🏆 Tournament Fixtures Ready!

Team: *{teamName}*

{fixtureDetails}

Please arrive 30 minutes before your first match. Good luck! ⚽";

            return await SendMessageAsync(phoneNumber, message);
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> SendMessageAsync(string phoneNumber, string message)
    {
        try
        {
            if (string.IsNullOrEmpty(_phoneNumberId) || string.IsNullOrEmpty(_accessToken))
            {
                return false;
            }

            // Format phone number (remove + and spaces)
            var formattedPhone = phoneNumber.Replace("+", "").Replace(" ", "").Replace("-", "");

            var url = $"https://graph.facebook.com/{_apiVersion}/{_phoneNumberId}/messages";

            var payload = new
            {
                messaging_product = "whatsapp",
                to = formattedPhone,
                type = "text",
                text = new { body = message }
            };

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_accessToken}");

            var response = await _httpClient.PostAsJsonAsync(url, payload);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        catch
        {
            return false;
        }
    }
}
