namespace SportHub.Application.DTOs;

// Shared models for WhatsApp controllers
public class EventInfo
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Sport { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string AgeGroups { get; set; } = string.Empty;
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

public class TeamInfo
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string CoachPhone { get; set; } = string.Empty;
}

public class FixtureInfo
{
    public int Id { get; set; }
    public string EventName { get; set; } = string.Empty;
    public string HomeTeam { get; set; } = string.Empty;
    public string AwayTeam { get; set; } = string.Empty;
    public DateTime MatchDate { get; set; }
    public string MatchTime { get; set; } = string.Empty;
    public string Pitch { get; set; } = string.Empty;
}

// Twilio-specific models
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

// AWS WhatsApp-specific models
public class AwsWhatsAppWebhookRequest
{
    public string Object { get; set; } = string.Empty;
    public List<WhatsAppEntry>? Entry { get; set; }
}

public class WhatsAppEntry
{
    public string Id { get; set; } = string.Empty;
    public List<WhatsAppChange>? Changes { get; set; }
}

public class WhatsAppChange
{
    public WhatsAppValue? Value { get; set; }
    public string Field { get; set; } = string.Empty;
}

public class WhatsAppValue
{
    public string MessagingProduct { get; set; } = string.Empty;
    public WhatsAppMetadata? Metadata { get; set; }
    public List<WhatsAppMessage>? Messages { get; set; }
}

public class WhatsAppMetadata
{
    public string DisplayPhoneNumber { get; set; } = string.Empty;
    public string PhoneNumberId { get; set; } = string.Empty;
}

public class WhatsAppMessage
{
    public string From { get; set; } = string.Empty;
    public string Id { get; set; } = string.Empty;
    public string Timestamp { get; set; } = string.Empty;
    public WhatsAppTextMessage? Text { get; set; }
    public WhatsAppInteractive? Interactive { get; set; }
    public string Type { get; set; } = string.Empty;
}

public class WhatsAppTextMessage
{
    public string Body { get; set; } = string.Empty;
}

public class WhatsAppInteractive
{
    public WhatsAppButtonReply? ButtonReply { get; set; }
}

public class WhatsAppButtonReply
{
    public string Title { get; set; } = string.Empty;
}
