# SportHub - AI-Powered Sports Tournament Management

🏆 **AWS CDS Agentic AI Hackathon - September 2026**

An intelligent, multi-channel sports tournament management system that leverages AWS AI services to automate team registrations, fixture scheduling, and provide conversational support via WhatsApp and web interfaces.

## 🎯 Problem Statement

Sports tournament organizers face challenges with:
- Manual team registration processes across multiple channels
- Complex fixture scheduling and conflict resolution
- Delayed communication with coaches and teams
- Repetitive Q&A about rules, fees, and tournament logistics

## 💡 Solution

SportHub provides an AI-powered platform that:
- **Conversational Registration**: Natural language team registration via WhatsApp using AWS Bedrock
- **Smart Scheduling**: Automatic fixture generation with conflict detection
- **Multi-Channel Support**: Unified backend serving both web and WhatsApp interfaces
- **Intelligent Q&A**: AWS Bedrock Knowledge Base for instant answers to tournament questions
- **Real-Time Notifications**: Automated email and WhatsApp updates

## 🏗️ Architecture

### Tech Stack
- **Backend**: .NET 10 ASP.NET Core Web API
- **Database**: AWS RDS MySQL
- **AI/ML**: AWS Bedrock (Claude 3.5 Sonnet), Knowledge Base
- **Messaging**: Twilio WhatsApp API, AWS SES
- **Hosting**: Render.com
- **Version Control**: GitHub

### AWS Services Integration

**AWS Bedrock**
- Model: Claude 3.5 Sonnet v2
- Use Cases: Natural language processing for team registration, conversational responses
- Region: us-east-1

**AWS Bedrock Knowledge Base**
- KB ID: `TBJIAEAUKM`
- Data Source: S3 bucket with tournament documentation
- Use Cases: Tournament rules, FAQs, policy queries
- Fallback: Pattern-matched responses for common questions

**AWS RDS MySQL**
- Instance: `sporthub-db.cr422g0k08ae.eu-west-1.rds.amazonaws.com`
- Region: eu-west-1
- Tables: events, teams, registrations, fixtures, notifications

**AWS SES**
- Verified Sender: `builders@umdoko.com`
- Use Cases: Registration confirmations, fixture notifications
- Region: eu-west-1

## 🚀 Key Features

### 1. WhatsApp Conversational Registration
```
User: "register"
Bot: "Welcome! Let's register your team. What's your team name?"
User: "Phoenix Warriors"
Bot: "Great! What age group? (U8, U10, U12, U14, U16)"
User: "U12"
Bot: "Perfect! What's your coach's name?"
...
```

**Features**:
- Step-by-step guided registration
- Session management for conversation state
- Age group validation against event requirements
- Automatic phone number capture
- Email confirmation via AWS SES

### 2. Smart Fixture Generation
- Automatic scheduling algorithm
- Conflict detection (no team plays twice at same time)
- Pitch allocation
- Automatic notifications to all registered coaches

### 3. Intelligent Q&A System
**Powered by AWS Bedrock Knowledge Base**
```
User: "What are the tournament rules?"
User: "How long are matches?"
User: "What happens if it rains?"
```

**Fallback System**: Pattern-matched responses for common queries when KB is unavailable

### 4. Real-Time Queries
```
User: "fixtures"
Bot: [Returns all scheduled matches for user's team]
```

### 5. Multi-Channel Architecture
- **Web Interface**: Full admin dashboard for event creation, team management
- **WhatsApp Bot**: User-friendly registration and queries
- **Unified Backend**: Single API serving both channels
- **Shared Database**: Consistent data across all touchpoints

## 📱 WhatsApp Bot Commands

| Command | Description |
|---------|-------------|
| `register` | Start team registration flow |
| `fixtures` | View your team's match schedule |
| `rules` | Get tournament rules |
| Natural questions | Ask anything about the tournament |

## 🎬 Demo

### Live System
- **API Endpoint**: https://sporthub-rng4.onrender.com
- **WhatsApp Bot**: Send "join wheel-thou" to `+1 415 523 8886`
- **Test Event**: "Summer Soccer League 2026" (ID: 1)

### Sample Flows

**Registration Flow**:
1. Send "register" to WhatsApp bot
2. Follow prompts for team name, age group, coach details
3. Receive email confirmation
4. Team ready for tournament

**Fixture Query**:
1. Send "fixtures" to WhatsApp bot
2. Receive formatted match schedule
3. Get notifications when fixtures are generated

**Q&A**:
1. Ask "What are the rules?"
2. Get instant response from Knowledge Base
3. Ask follow-up questions naturally

## 🔧 Installation & Setup

### Prerequisites
- .NET 10 SDK
- AWS Account with Bedrock access
- Twilio Account (WhatsApp sandbox)
- MySQL database (or AWS RDS)

### Environment Variables
```bash
# Database
ConnectionStrings__DefaultConnection="Server=your-db;Database=sporthub;..."

# AWS Configuration
AWS__AccessKeyId=your_access_key
AWS__SecretAccessKey=your_secret_key
AWS__BedrockAccessKeyId=your_bedrock_key
AWS__BedrockSecretAccessKey=your_bedrock_secret
AWS__KnowledgeBaseId=your_kb_id
AWS__Region=eu-west-1

# AWS SES
SES__SenderEmail=your-verified-email@domain.com

# Twilio
Twilio__AccountSid=your_account_sid
Twilio__AuthToken=your_auth_token
Twilio__WhatsAppFrom=whatsapp:+14155238886
```

### Running Locally
```bash
# Clone repository
git clone https://github.com/precious28/SportHub.git
cd SportHub/backend/src/SportHub

# Restore dependencies
dotnet restore

# Run migrations (if using EF Core) or execute SQL scripts
# Scripts located in: Infrastructure/SqlScripts/CreateTable/

# Run application
dotnet run

# API available at: http://localhost:5000
```

### Deployment
The application is deployed on Render.com with:
- Automatic deployments from `main` branch
- Environment variables configured in Render dashboard
- HTTPS enabled
- Health checks configured

## 📊 Database Schema

**Core Tables**:
- `events`: Tournament events (name, location, dates, age groups)
- `teams`: Registered teams (name, age group, coach info)
- `registrations`: Event-team mappings
- `fixtures`: Match schedules (date, time, pitch, teams)
- `notifications`: Notification history

## 🧪 Testing

### Manual Testing Checklist
- ✅ WhatsApp registration end-to-end
- ✅ Age group validation
- ✅ Email confirmations
- ✅ Fixture generation
- ✅ Fixture queries via WhatsApp
- ✅ Q&A with Knowledge Base
- ✅ Multi-team tournament handling
- ✅ Notification delivery

### Test Credentials
- WhatsApp: Any phone number (sandbox mode)
- Test Event ID: 1 (Summer Soccer League 2026)

## 🎓 Technical Highlights

### Agentic AI Implementation
- **Conversational State Management**: Session-based tracking of registration progress
- **Intent Recognition**: Pattern matching + Bedrock for natural language understanding
- **Context Awareness**: System maintains user context across message exchanges
- **Autonomous Actions**: Automatic fixture generation and notification dispatch
- **Knowledge Retrieval**: RAG-based Q&A using Bedrock Knowledge Base

### Clean Architecture
- **Domain Layer**: Entity models, business logic
- **Application Layer**: Services, DTOs, interfaces
- **Infrastructure Layer**: Data access, external service integrations
- **API Layer**: Controllers, request/response handling

### Best Practices
- Repository pattern for data access
- Dependency injection throughout
- DTO mapping for API contracts
- Async/await for I/O operations
- TwiML responses for WhatsApp reliability
- Error handling and logging

## 🚧 Known Limitations

- **Twilio Sandbox**: 72-hour session limit (can rejoin unlimited times)
- **In-Memory Sessions**: Registration state cleared on app restart (suitable for hackathon demo)
- **Single Event Focus**: Current WhatsApp flow assumes one active event

## 🔮 Future Enhancements

- [ ] Multi-event selection in WhatsApp flow
- [ ] Live score updates via WhatsApp
- [ ] Team standings and leaderboards
- [ ] Referee assignment automation
- [ ] Multi-language support (Portuguese, Swahili)
- [ ] WhatsApp Business API (verified number)
- [ ] Redis session persistence
- [ ] Admin WhatsApp commands

## 👥 Team

**Organization**: Umdoko Internet
**Developer**: Precious Amusema
- GitHub: [@precious28](https://github.com/precious28)
- Email: builders@umdoko.com

## 📜 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- AWS Community Builders Program
- Twilio WhatsApp Sandbox
- AWS Bedrock Team
- Render.com Platform

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Email: builders@umdoko.com

---

**Built with ❤️ for AWS CDS Agentic AI Hackathon - September 2026**

*Empowering sports communities with intelligent automation*
