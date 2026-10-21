using Microsoft.AspNetCore.Mvc;
using SportHub.Application.Services;
using SportHub.Application.DTOs;
using System.Text;
using System.Text.Json;
using System.Collections.Concurrent;

namespace SportHub.API.Controllers;

[ApiController]
[Route("api/aws-whatsapp")]
public class AwsWhatsAppWebhookController : ControllerBase
{
    private readonly AwsWhatsAppService _whatsappService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AwsWhatsAppWebhookController> _logger;
    private readonly IHttpClientFactory _httpClientFactory;
    
    // In-memory session storage (for production, use Redis or database)
    private static readonly ConcurrentDictionary<string, UserSession> _sessions = new();

    public AwsWhatsAppWebhookController(
        AwsWhatsAppService whatsappService,
        IConfiguration configuration,
        ILogger<AwsWhatsAppWebhookController> logger,
        IHttpClientFactory httpClientFactory)
    {
        _whatsappService = whatsappService;
        _configuration = configuration;
        _logger = logger;
        _httpClientFactory = httpClientFactory;
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> ReceiveMessage([FromBody] JsonElement requestBody)
    {
        try
        {
            _logger.LogInformation("Received AWS WhatsApp webhook: {Json}", 
                requestBody.ToString());

            // Check if this is an SNS subscription confirmation
            if (requestBody.TryGetProperty("Type", out var typeElement))
            {
                var messageType = typeElement.GetString();
                
                if (messageType == "SubscriptionConfirmation")
                {
                    // Confirm SNS subscription
                    if (requestBody.TryGetProperty("SubscribeURL", out var urlElement))
                    {
                        var subscribeUrl = urlElement.GetString();
                        _logger.LogInformation("Confirming SNS subscription: {Url}", subscribeUrl);
                        
                        var httpClient = _httpClientFactory.CreateClient();
                        await httpClient.GetAsync(subscribeUrl);
                        
                        return Ok(new { status = "subscription_confirmed" });
                    }
                }
                
                // Handle SNS notification
                if (messageType == "Notification")
                {
                    if (requestBody.TryGetProperty("Message", out var messageElement))
                    {
                        var messageJson = messageElement.GetString();
                        if (string.IsNullOrEmpty(messageJson))
                        {
                            return Ok(new { status = "empty_message" });
                        }

                        // Parse the actual WhatsApp webhook payload from SNS message
                        var whatsappPayload = JsonSerializer.Deserialize<AwsWhatsAppWebhookRequest>(messageJson);
                        
                        if (whatsappPayload?.Entry == null || !whatsappPayload.Entry.Any())
                        {
                            return Ok(new { status = "no_entry" });
                        }

                        await ProcessWhatsAppMessage(whatsappPayload);
                    }
                }
            }
            else
            {
                // Direct webhook call (for testing)
                var whatsappPayload = JsonSerializer.Deserialize<AwsWhatsAppWebhookRequest>(requestBody.ToString());
                if (whatsappPayload?.Entry != null && whatsappPayload.Entry.Any())
                {
                    await ProcessWhatsAppMessage(whatsappPayload);
                }
            }

            return Ok(new { status = "ok" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing AWS WhatsApp webhook");
            return Ok(new { status = "error", message = ex.Message });
        }
    }

    private async Task ProcessWhatsAppMessage(AwsWhatsAppWebhookRequest request)
    {
        foreach (var entry in request.Entry ?? new List<WhatsAppEntry>())
        {
            if (entry.Changes == null || !entry.Changes.Any())
                continue;

            foreach (var change in entry.Changes)
            {
                if (change.Value?.Messages == null || !change.Value.Messages.Any())
                    continue;

                foreach (var message in change.Value.Messages)
                {
                    var userMessage = message.Text?.Body ?? message.Interactive?.ButtonReply?.Title ?? "";
                    var fromNumber = message.From;

                    if (string.IsNullOrWhiteSpace(userMessage) || string.IsNullOrWhiteSpace(fromNumber))
                        continue;

                    _logger.LogInformation("Processing message from {From}: {Message}", 
                        fromNumber, userMessage);

                    // Process the message
                    var response = await ProcessMessageAsync(userMessage, fromNumber);

                    // Send response back via AWS WhatsApp
                    await _whatsappService.SendMessageAsync(fromNumber, response);
                }
            }
        }
    }

    [HttpGet("webhook")]
    public IActionResult VerifyWebhook([FromQuery] string hub_mode, [FromQuery] string hub_verify_token, [FromQuery] string hub_challenge)
    {
        // AWS WhatsApp webhook verification
        var verifyToken = _configuration["AWS:WhatsAppVerifyToken"] ?? "sporthub_verify_token_2024";
        
        if (hub_mode == "subscribe" && hub_verify_token == verifyToken)
        {
            _logger.LogInformation("Webhook verified successfully");
            return Content(hub_challenge, "text/plain");
        }

        _logger.LogWarning("Webhook verification failed");
        return Forbid();
    }

    private async Task<string> ProcessMessageAsync(string userMessage, string userId)
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
            
            // Check for explicit command keywords first
            if (messageLower == "register" || messageLower == "sign up" || messageLower == "join")
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
            else if (messageLower == "events" || messageLower == "tournaments")
            {
                var events = await GetAvailableEventsAsync();
                if (events.Any())
                {
                    var eventList = string.Join("\n", events.Select(e => $"• {e.Name} - {e.Sport} on {e.StartDate:MMM dd, yyyy}"));
                    return $"📅 Upcoming tournaments:\n\n{eventList}\n\nType 'register' to sign up your team!";
                }
                return "There are no active tournaments at the moment. Check back soon!";
            }
            else if (messageLower == "help" || messageLower == "hi" || messageLower == "hello")
            {
                return "👋 Welcome to SportHub! I'm your AI tournament assistant.\n\n" +
                       "I can help you:\n" +
                       "• *register* - Register your team\n" +
                       "• *events* - View tournaments\n" +
                       "• *fixtures* - Check your fixtures\n" +
                       "• *rules* - Tournament rules & FAQs\n" +
                       "• *help* - Show this menu\n\n" +
                       "Ask me anything about tournaments!";
            }
            else if (messageLower.Contains("fixture"))
            {
                // Query fixtures
                var fixtures = await GetUserFixturesAsync(userId);
                if (fixtures.Any())
                {
                    var fixtureList = string.Join("\n\n", fixtures.Select(f => 
                        $"🏆 *{f.EventName}*\n" +
                        $"📅 {f.MatchDate:MMM dd, yyyy} at {f.MatchTime}\n" +
                        $"⚽ {f.HomeTeam} vs {f.AwayTeam}\n" +
                        $"📍 {f.Pitch}"));
                    
                    return $"📋 *Your Upcoming Fixtures*\n\n{fixtureList}";
                }
                return "You don't have any fixtures yet. Register your team first!";
            }
            else
            {
                // Answer common questions with pattern matching
                var answer = GetAnswerForQuestion(userMessage);
                if (!string.IsNullOrEmpty(answer))
                {
                    return answer;
                }
                
                return "I can help you with:\n\n" +
                       "• *register* - Start registration\n" +
                       "• *events* - View tournaments\n" +
                       "• *fixtures* - Check fixtures\n" +
                       "• Ask questions like: 'What are the rules?' or 'How much is the fee?'\n\n" +
                       "What would you like to know?";
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing message");
            return "I'm having trouble right now. Please try again.";
        }
    }

    // ... (Copy all the other methods from WhatsAppWebhookController)
    // HandleRegistrationFlowAsync, RegisterTeamAsync, GetAvailableEventsAsync, 
    // GetAnswerForQuestion, GetUserFixturesAsync

    private async Task<string> HandleRegistrationFlowAsync(string userMessage, UserSession session, string userId)
    {
        // Same as WhatsAppWebhookController - copy the implementation
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
                
                var ageGroups = session.SelectedEvent?.AgeGroups ?? "";
                if (!string.IsNullOrEmpty(ageGroups))
                {
                    return $"✅ School: *{userMessage}*\n\n" +
                           $"Available age groups for this event:\n*{ageGroups}*\n\n" +
                           "Which age group is your team?";
                }
                return $"✅ School: *{userMessage}*\n\n" +
                       "What age group?\n" +
                       "(e.g., U11, U13, U15, U17, U19, Senior)";

            case RegistrationStep.EnteringAgeGroup:
                var allowedGroups = session.SelectedEvent?.AgeGroups ?? "";
                if (!string.IsNullOrEmpty(allowedGroups))
                {
                    var groupsList = allowedGroups.Split(',').Select(g => g.Trim().ToUpper()).ToList();
                    if (!groupsList.Contains(userMessage.Trim().ToUpper()))
                    {
                        return $"❌ '{userMessage}' is not allowed for this event.\n\n" +
                               $"Please choose from: *{allowedGroups}*";
                    }
                }
                
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
                session.CoachPhone = "+" + userId.TrimStart('+'); // Use phone number
                session.Step = RegistrationStep.Confirming;
                
                return $"📋 *Registration Summary*\n\n" +
                       $"Event: {session.SelectedEvent?.Name}\n" +
                       $"Team: {session.TeamName}\n" +
                       $"School: {session.SchoolName}\n" +
                       $"Age Group: {session.AgeGroup}\n" +
                       $"Coach: {session.CoachName}\n" +
                       $"Email: {session.CoachEmail}\n" +
                       $"Phone: {session.CoachPhone} (from WhatsApp)\n\n" +
                       $"Reply *YES* to confirm or *CANCEL* to start over.";

            case RegistrationStep.Confirming:
                if (userMessage.Equals("yes", StringComparison.OrdinalIgnoreCase))
                {
                    var result = await RegisterTeamAsync(session);
                    _sessions.TryRemove(userId, out _);
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

            var registrationDto = new
            {
                eventId = session.SelectedEvent?.Id,
                teamId = teamData?.Id,
                ageGroup = session.AgeGroup,
                division = ""
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

    private string GetAnswerForQuestion(string question)
    {
        var questionLower = question.ToLower();
        
        if (questionLower.Contains("rule") || questionLower.Contains("regulation"))
        {
            return "📋 *Tournament Rules*\n\n" +
                   "• Teams: 11-18 players per squad\n" +
                   "• Registration: At least 7 days before event\n" +
                   "• Fee: R500 per team\n" +
                   "• Match duration varies by age group\n" +
                   "• Required equipment: Team jerseys, shin guards, appropriate footwear\n" +
                   "• Fair play and respect mandatory\n\n" +
                   "For full rules, email tournaments@sporthub.com";
        }
        
        if (questionLower.Contains("fee") || questionLower.Contains("cost") || questionLower.Contains("price") || questionLower.Contains("pay"))
        {
            return "💰 *Registration Fees*\n\n" +
                   "Standard: R500 per team\n" +
                   "Late registration (< 7 days): R700\n\n" +
                   "Payment methods:\n" +
                   "• Bank transfer (details on registration)\n" +
                   "• Cash on tournament day\n" +
                   "• Card payment at venue";
        }
        
        if (questionLower.Contains("long") || questionLower.Contains("duration") || questionLower.Contains("time") || questionLower.Contains("minutes"))
        {
            return "⏱️ *Match Duration by Age*\n\n" +
                   "• U11, U13: 2 × 25 min halves\n" +
                   "• U15, U17: 2 × 30 min halves\n" +
                   "• U19, Senior: 2 × 40 min halves\n\n" +
                   "Half-time: 5-10 minutes\n" +
                   "Minimum 60 minutes rest between matches for same team";
        }
        
        return string.Empty;
    }

    private async Task<List<FixtureInfo>> GetUserFixturesAsync(string userId)
    {
        try
        {
            var httpClient = _httpClientFactory.CreateClient();
            var apiUrl = _configuration["API:BaseUrl"] ?? "https://sporthub-rng4.onrender.com";
            var phoneNumber = "+" + userId.TrimStart('+');
            
            var teamsResponse = await httpClient.GetAsync($"{apiUrl}/Teams");
            
            if (!teamsResponse.IsSuccessStatusCode)
            {
                return new List<FixtureInfo>();
            }

            var teamsJson = await teamsResponse.Content.ReadAsStringAsync();
            var allTeams = JsonSerializer.Deserialize<List<TeamInfo>>(teamsJson, new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true 
            }) ?? new List<TeamInfo>();

            var userTeams = allTeams.Where(t => t.CoachPhone?.Replace("+", "").Replace(" ", "") == phoneNumber.Replace("+", "").Replace(" ", "")).ToList();
            
            if (!userTeams.Any())
            {
                return new List<FixtureInfo>();
            }

            var allFixtures = new List<FixtureInfo>();
            
            foreach (var team in userTeams)
            {
                var fixturesResponse = await httpClient.GetAsync($"{apiUrl}/Fixtures");
                
                if (fixturesResponse.IsSuccessStatusCode)
                {
                    var fixturesJson = await fixturesResponse.Content.ReadAsStringAsync();
                    var fixtures = JsonSerializer.Deserialize<List<FixtureInfo>>(fixturesJson, new JsonSerializerOptions 
                    { 
                        PropertyNameCaseInsensitive = true 
                    }) ?? new List<FixtureInfo>();

                    var teamFixtures = fixtures.Where(f => 
                        f.HomeTeam == team.Name || f.AwayTeam == team.Name).ToList();
                    
                    allFixtures.AddRange(teamFixtures);
                }
            }

            return allFixtures
                .Where(f => f.MatchDate >= DateTime.Today)
                .OrderBy(f => f.MatchDate)
                .ThenBy(f => f.MatchTime)
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching user fixtures");
            return new List<FixtureInfo>();
        }
    }
}
