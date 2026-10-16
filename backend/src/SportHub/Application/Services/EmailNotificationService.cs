using Amazon.SimpleEmail;
using Amazon.SimpleEmail.Model;
using Microsoft.Extensions.Configuration;

namespace SportHub.Application.Services;

public class EmailNotificationService
{
    private readonly IAmazonSimpleEmailService _sesClient;
    private readonly IConfiguration _configuration;

    public EmailNotificationService(IAmazonSimpleEmailService sesClient, IConfiguration configuration)
    {
        _sesClient = sesClient;
        _configuration = configuration;
    }

    public async Task<bool> SendRegistrationConfirmationAsync(string toEmail, string teamName, string eventName, string coachName)
    {
        try
        {
            var fromEmail = _configuration["Email:FromEmail"] ?? "noreply@sporthub.com";
            var fromName = _configuration["Email:FromName"] ?? "SportHub";
            
            var subject = $"Registration Confirmed - {eventName}";
            var body = $@"
Hello {coachName},

Your team '{teamName}' has been successfully registered for {eventName}!

We're excited to have you participate. You'll receive fixture details once the tournament schedule is generated.

Registration Details:
- Team: {teamName}
- Coach: {coachName}
- Event: {eventName}

If you have any questions, please contact the tournament organizers.

Best regards,
SportHub Tournament Management Team
";

            var sendRequest = new SendEmailRequest
            {
                Source = $"{fromName} <{fromEmail}>",
                Destination = new Destination
                {
                    ToAddresses = new List<string> { toEmail }
                },
                Message = new Message
                {
                    Subject = new Content(subject),
                    Body = new Body
                    {
                        Text = new Content(body)
                    }
                }
            };

            var response = await _sesClient.SendEmailAsync(sendRequest);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> SendFixtureNotificationAsync(string toEmail, string teamName, string fixtureDetails)
    {
        try
        {
            var fromEmail = _configuration["Email:FromEmail"] ?? "noreply@sporthub.com";
            var fromName = _configuration["Email:FromName"] ?? "SportHub";
            
            var subject = $"Tournament Fixtures Ready - {teamName}";
            var body = $@"
Hello Coach,

The tournament fixtures for {teamName} are now available!

{fixtureDetails}

Please ensure your team arrives 30 minutes before your first match.

Good luck!

Best regards,
SportHub Tournament Management Team
";

            var sendRequest = new SendEmailRequest
            {
                Source = $"{fromName} <{fromEmail}>",
                Destination = new Destination
                {
                    ToAddresses = new List<string> { toEmail }
                },
                Message = new Message
                {
                    Subject = new Content(subject),
                    Body = new Body
                    {
                        Text = new Content(body)
                    }
                }
            };

            var response = await _sesClient.SendEmailAsync(sendRequest);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> SendTestEmailAsync(string toEmail, string subject, string body)
    {
        try
        {
            var fromEmail = _configuration["Email:FromEmail"] ?? "noreply@sporthub.com";
            var fromName = _configuration["Email:FromName"] ?? "SportHub";

            var sendRequest = new SendEmailRequest
            {
                Source = $"{fromName} <{fromEmail}>",
                Destination = new Destination
                {
                    ToAddresses = new List<string> { toEmail }
                },
                Message = new Message
                {
                    Subject = new Content(subject),
                    Body = new Body
                    {
                        Text = new Content(body)
                    }
                }
            };

            var response = await _sesClient.SendEmailAsync(sendRequest);
            return true;
        }
        catch
        {
            return false;
        }
    }
}
