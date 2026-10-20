using Microsoft.AspNetCore.Mvc;
using SportHub.Application.Services;
using SportHub.Application.DTOs;
using System.Text;
using System.Text.Json;
using System.Collections.Concurrent;

namespace SportHub.API.Controllers;

[ApiController]
[Route("api/whatsapp")]
public class WhatsAppWebhookController : ControllerBase
{
    private readonly TwilioWhatsAppService _whatsappService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<WhatsAppWebhookController> _logger;
    private readonly IHttpClientFactory _httpClientFactory;
    
    // In-memory session storage (for production, use Redis or database)
    private static readonly ConcurrentDictionary<string, UserSession> _sessions = new();

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
            _logger.LogInformation("Processing message: {Message} from {User}", userMessage, userId);
            
            // Get or create user session
            var session = _sessions.GetOrAdd(userId, _ => new UserSession());
            
            // Handle cancellation
            if (userMessage.Equals("cancel", StringComparison.OrdinalIgnoreCase) || 
                userMessage.Equals("stop", StringComparison.OrdinalIgnoreCase))
            {
                _sessions.TryRemove(userId, out _);
                return "Registration cancelled. Type 'register' to start again, or 'help' for options.";
            }
            
            // If user is in registration flow
            if (session.IsRegistering)
            {
                return await HandleRegistrationFlowAsync(userMessage, session, userId);
            }
            
            // Handle initial commands
            var messageLower = userMessage.ToLower();
            
            if (messageLower.Contains("register") || messageLower.Contains("sign up") || messageLower.Contains("join"))
            {
                var events = await GetAvailableEventsAsync();
                if (events.Any())
                {
                    session.IsRegistering = true;
                    session.Step = RegistrationStep.ChoosingEvent;
                    session.AvailableEvents = events;
                    
                    var eventList = string.Join("\n", events.Select((e, i) => $"{i + 1}. {e.Name} ({e.StartDate:MMM dd})"));
                    return $"🏆 Great! Let's register your team.\n\n" +
                           $"Available tournaments:\n{eventList}\n\n" +
                           $"Reply with the NUMBER (1, 2, etc.) of the event you want.\n\n" +
                           $"Type 'cancel' anytime to stop.";
                }
                return "I'm ready to help you register! However, there are no active events right now. Please check back later.";
            }
            else if (messageLower.Contains("event") || messageLower.Contains("tournament"))
            {
                var events = await GetAvailableEventsAsync();
                if (events.Any())
                {
                    var eventList = string.Join("\n", events.Select(e => $"• {e.Name} - {e.Sport} on {e.StartDate:MMM dd, yyyy}"));
                    return $"📅 Upcoming tournaments:\n\n{eventList}\n\nType 'register' to sign up your team!";
                }
                return "There are no active tournaments at the moment. Check back soon!";
            }
            else if (messageLower.Contains("help") || messageLower.Contains("hi") || messageLower.Contains("hello"))
            {
                return "👋 Welcome to SportHub! I'm your AI tournament assistant.\n\n" +
                       "I can help you:\n" +
                       "• *register* - Register your team\n" +
                       "• *events* - View tournaments\n" +
                       "• *help* - Show this menu\n\n" +
                       "What would you like to do?";
            }
            else
            {
                return "I can help you register teams for tournaments!\n\n" +
                       "Try:\n" +
                       "• *register* - Start registration\n" +
                       "• *events* - View tournaments\n" +
                       "• *help* - See all options";
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing message");
            return "I'm having trouble right now. Please try again.";
        }
    }

    private async Task<string> HandleRegistrationFlowAsync(string userMessage, UserSession session, string userId)
    {
        switch (session.Step)
        {
            case RegistrationStep.ChoosingEvent:
                if (int.TryParse(userMessage, out int eventIndex) && 
                    eventIndex > 0 && eventIndex <= session.AvailableEvents.Count)
                {
                    session.SelectedEvent = session.AvailableEvents[eventIndex - 1];
                    session.Step = RegistrationStep.EnteringTeamName;
                    return $"✅ Great! You selected: *{session.SelectedEvent.Name}*\n\n" +
                           "What's your team name?";
                }
                return "Please enter a valid number from the list above.";

            case RegistrationStep.EnteringTeamName:
                session.TeamName = userMessage;
                session.Step = RegistrationStep.EnteringSchoolName;
                return $"✅ Team: *{userMessage}*\n\n" +
                       "What's your school/organization name?";

            case RegistrationStep.EnteringSchoolName:
                session.SchoolName = userMessage;
                session.Step = RegistrationStep.EnteringAgeGroup;
                return $"✅ School: *{userMessage}*\n\n" +
                       "What age group?\n" +
                       "(e.g., U15, U17, U19, Senior)";

            case RegistrationStep.EnteringAgeGroup:
                session.AgeGroup = userMessage;
                session.Step = RegistrationStep.EnteringCoachName;
                return $"✅ Age Group: *{userMessage}*\n\n" +
                       "What's the coach's name?";

            case RegistrationStep.EnteringCoachName:
                session.CoachName = userMessage;
                session.Step = RegistrationStep.EnteringCoachEmail;
                return $"✅ Coach: *{userMessage}*\n\n" +
                       "What's the coach's email address?";

            case RegistrationStep.EnteringCoachEmail:
                if (!userMessage.Contains("@"))
                {
                    return "Please enter a valid email address (must contain @)";
                }
                session.CoachEmail = userMessage;
                session.CoachPhone = userId.Replace("whatsapp:", ""); // Use WhatsApp number
                session.Step = RegistrationStep.Confirming;
                
                return $"📋 *Registration Summary*\n\n" +
                       $"Event: {session.SelectedEvent?.Name}\n" +
                       $"Team: {session.TeamName}\n" +
                       $"School: {session.SchoolName}\n" +
                       $"Age Group: {session.AgeGroup}\n" +
                       $"Coach: {session.CoachName}\n" +
                       $"Email: {session.CoachEmail}\n" +
                       $"Phone: {session.CoachPhone}\n\n" +
                       $"Reply *YES* to confirm or *CANCEL* to start over.";

            case RegistrationStep.Confirming:
                if (userMessage.Equals("yes", StringComparison.OrdinalIgnoreCase))
                {
                    // Register the team
                    var result = await RegisterTeamAsync(session);
                    _sessions.TryRemove(userId, out _); // Clear session
                    return result;
                }
                else if (userMessage.Equals("cancel", StringComparison.OrdinalIgnoreCase))
                {
                    _sessions.TryRemove(userId, out _);
                    return "Registration cancelled. Type 'register' to start again!";
                }
                return "Please reply *YES* to confirm or *CANCEL* to abort.";

            default:
                return "Something went wrong. Type 'register' to start over.";
        }
    }

    private async Task<string> RegisterTeamAsync(UserSession session)
    {
        try
        {
            var httpClient = _httpClientFactory.CreateClient();
            var apiUrl = _configuration["API:BaseUrl"] ?? "https://sporthub-rng4.onrender.com";
            
            // First, create the team
            var teamDto = new
            {
                name = session.TeamName,
                schoolName = session.SchoolName,
                coachName = session.CoachName,
                coachPhone = session.CoachPhone,
                coachEmail = session.CoachEmail,
                ageGroup = session.AgeGroup
            };

            var teamJson = JsonSerializer.Serialize(teamDto);
            var teamContent = new StringContent(teamJson, Encoding.UTF8, "application/json");
            
            var teamResponse = await httpClient.PostAsync($"{apiUrl}/Teams", teamContent);
            
            if (!teamResponse.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to create team: {StatusCode}", teamResponse.StatusCode);
                return "❌ Sorry, there was an error creating your team. Please try again later or contact support.";
            }

            var teamResponseJson = await teamResponse.Content.ReadAsStringAsync();
            var teamData = JsonSerializer.Deserialize<WhatsAppTeamResponse>(teamResponseJson, new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true 
            });

            // Then, register for the event
            var registrationDto = new
            {
                eventId = session.SelectedEvent?.Id,
                teamId = teamData?.Id
            };

            var regJson = JsonSerializer.Serialize(registrationDto);
            var regContent = new StringContent(regJson, Encoding.UTF8, "application/json");
            
            var regResponse = await httpClient.PostAsync($"{apiUrl}/Registrations", regContent);
            
            if (regResponse.IsSuccessStatusCode)
            {
                return $"🎉 *Registration Successful!*\n\n" +
                       $"Team *{session.TeamName}* is now registered for *{session.SelectedEvent?.Name}*!\n\n" +
                       $"✅ Confirmation email sent to {session.CoachEmail}\n" +
                       $"✅ You'll receive fixture updates via WhatsApp\n\n" +
                       $"Good luck! 🏆\n\n" +
                       $"Type 'events' to see other tournaments.";
            }
            else
            {
                _logger.LogError("Failed to register team: {StatusCode}", regResponse.StatusCode);
                return "❌ Team created but registration failed. Please contact support with your team name.";
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration");
            return "❌ Registration failed. Please try again later.";
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

public class WhatsAppTeamResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class UserSession
{
    public bool IsRegistering { get; set; }
    public RegistrationStep Step { get; set; }
    public List<EventInfo> AvailableEvents { get; set; } = new();
    public EventInfo? SelectedEvent { get; set; }
    public string TeamName { get; set; } = string.Empty;
    public string SchoolName { get; set; } = string.Empty;
    public string AgeGroup { get; set; } = string.Empty;
    public string CoachName { get; set; } = string.Empty;
    public string CoachEmail { get; set; } = string.Empty;
    public string CoachPhone { get; set; } = string.Empty;
}

public enum RegistrationStep
{
    ChoosingEvent,
    EnteringTeamName,
    EnteringSchoolName,
    EnteringAgeGroup,
    EnteringCoachName,
    EnteringCoachEmail,
    Confirming
}
