using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;
using Microsoft.Extensions.Configuration;

namespace SportHub.Application.Services;

public class TwilioWhatsAppService
{
    private readonly string _accountSid;
    private readonly string _authToken;
    private readonly string _whatsappFrom;

    public TwilioWhatsAppService(IConfiguration configuration)
    {
        _accountSid = configuration["Twilio:AccountSid"] 
            ?? throw new InvalidOperationException("Twilio:AccountSid not configured");
        _authToken = configuration["Twilio:AuthToken"] 
            ?? throw new InvalidOperationException("Twilio:AuthToken not configured");
        _whatsappFrom = configuration["Twilio:WhatsAppFrom"] 
            ?? throw new InvalidOperationException("Twilio:WhatsAppFrom not configured");

        TwilioClient.Init(_accountSid, _authToken);
    }

    public async Task<string> SendMessageAsync(string toPhoneNumber, string messageBody)
    {
        try
        {
            // Ensure phone number is in WhatsApp format
            if (!toPhoneNumber.StartsWith("whatsapp:"))
            {
                toPhoneNumber = $"whatsapp:{toPhoneNumber}";
            }

            var message = await MessageResource.CreateAsync(
                body: messageBody,
                from: new PhoneNumber(_whatsappFrom),
                to: new PhoneNumber(toPhoneNumber)
            );

            return message.Sid;
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to send WhatsApp message: {ex.Message}", ex);
        }
    }

    public async Task SendRegistrationConfirmationAsync(
        string toPhoneNumber, 
        string teamName, 
        string eventName,
        string coachName)
    {
        var message = $"✅ *Registration Confirmed!*\n\n" +
                     $"Team: {teamName}\n" +
                     $"Event: {eventName}\n" +
                     $"Coach: {coachName}\n\n" +
                     $"You will receive fixture notifications via WhatsApp and email.\n\n" +
                     $"Good luck! 🏆";

        await SendMessageAsync(toPhoneNumber, message);
    }

    public async Task SendFixtureNotificationAsync(
        string toPhoneNumber,
        string teamName,
        string opponent,
        DateTime matchDateTime,
        string pitch,
        string eventName)
    {
        var message = $"🏐 *Fixture Alert*\n\n" +
                     $"Event: {eventName}\n" +
                     $"Your Team: {teamName}\n" +
                     $"Opponent: {opponent}\n" +
                     $"📅 Date: {matchDateTime:dddd, MMMM dd, yyyy}\n" +
                     $"⏰ Time: {matchDateTime:HH:mm}\n" +
                     $"📍 Pitch: {pitch}\n\n" +
                     $"Be there 15 minutes early! Good luck! 💪";

        await SendMessageAsync(toPhoneNumber, message);
    }

    public async Task SendEventUpdateAsync(
        string toPhoneNumber,
        string eventName,
        string updateMessage)
    {
        var message = $"📢 *Event Update - {eventName}*\n\n{updateMessage}";
        await SendMessageAsync(toPhoneNumber, message);
    }
}
