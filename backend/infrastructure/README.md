# SportHub AWS Bedrock Integration

Complete setup for integrating SportHub with AWS Bedrock Harness for AI-powered tournament management.

## 🎯 Overview

This integration enables natural language interaction with SportHub through AWS Bedrock, allowing coaches to:
- Register teams using conversational AI
- Get fixture information through chat
- Create events with natural language
- Check registration status and capacity

## Architecture

```
User (WhatsApp/Chat)
    ↓
Amazon Bedrock Harness (Claude Sonnet 4.6)
    ↓
Gateway (OpenAPI Integration)
    ↓
SportHub API (HTTPS)
    ↓
MySQL Database
```

**Note:** Uses the new Bedrock Harness with Gateway approach (no Lambda proxy required).

## 📁 Files in this Directory

- `sporthub-openapi.json` - OpenAPI 3.0 schema for Bedrock Gateway integration
- `agent-instructions.md` - System instructions for the AI agent
- `aws-bedrock-setup.md` - Setup instructions for Bedrock Harness with Gateway
- `aws-cds-integration.md` - AWS CDS Agentic AI Hackathon integration details
- `.env.example` - Environment variable template
- `README.md` - This file

## 🚀 Quick Start

### Prerequisites

1. AWS account with Bedrock permissions
2. SportHub API deployed to HTTPS endpoint
3. OpenAPI schema configured with your API URL

### Setup Steps

1. **Deploy SportHub API to public HTTPS endpoint**
   ```bash
   # Option 1: Use ngrok for testing
   ngrok http 5178
   
   # Option 2: Deploy to AWS EC2/Elastic Beanstalk with SSL
   ```

2. **Update OpenAPI schema with your URL**
   Edit `sporthub-openapi.json`:
   ```json
   {
     "servers": [
       {
         "url": "https://your-api-url.com",
         "description": "SportHub API"
       }
     ]
   }
   ```

3. **Create Bedrock Harness in AWS Console**
   - Go to Amazon Bedrock → AgentCore → Harnesses
   - Click "Create Harness" → "Advanced Harness"
   - Model: Claude Sonnet 4.6
   - Instructions: Paste from `agent-instructions.md`

4. **Add Gateway Target**
   - In the Harness, click "Add Target"
   - Choose "Gateway"
   - Upload `sporthub-openapi.json`
   - Verify all endpoints have `operationId`

5. **Test in Console**
   - Use Bedrock console test interface
   - Try: "Create a soccer tournament for U13 and U15 teams"

For detailed instructions, see `aws-bedrock-setup.md`.

## 🎯 Supported Functions

### Event Management
- **CreateEvent**: Create new tournaments with age groups and divisions
- **GetEventInfo**: Retrieve event details and requirements
- **CheckRegistrationStatus**: Check capacity and availability

### Team Registration
- **RegisterTeam**: Register teams with school and coach details
- **CheckCanRegister**: Validate registration eligibility

### Fixture Management
- **GenerateFixtures**: Create match schedules with smart constraints
- **GetTeamFixtures**: Retrieve team-specific fixture information

## 🔧 Configuration

### API Requirements

Gateway requires:
- ✅ HTTPS endpoint (not HTTP)
- ✅ OpenAPI 3.0+ schema
- ✅ All operations have `operationId`
- ✅ Valid JSON request/response schemas
- ✅ CORS enabled for Bedrock access

### Environment Configuration

The API reads configuration from `appsettings.json`:

```json
{
  "AWS": {
    "Region": "eu-west-1"
  },
  "Email": {
    "FromEmail": "builders@umdoko.com"
  },
  "WhatsApp": {
    "PhoneNumberId": "YOUR_PHONE_NUMBER_ID",
    "AccessToken": "YOUR_ACCESS_TOKEN"
  }
}
```

## 🚧 Known Issues

### Organization SCP Blocking Bedrock

Current blocker: `AccessDeniedException` due to Service Control Policy.

**Resolution:** Contact AWS organization admin to allow Bedrock services in the SCP.

**Affected ARN:**
```
arn:aws:organizations::723779706321:policy/o-gurvqx2a0l/service_control_policy/p-azucm9cq
```

## 🔒 Security

### IAM Permissions Required

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:*",
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "*"
    }
  ]
}
```

### Best Practices

1. Deploy API with proper SSL certificate
2. Enable API authentication if needed
3. Use AWS WAF for API protection
4. Monitor CloudWatch for suspicious activity
5. Regular security reviews of IAM policies

## 📊 Integration Points

The Bedrock agent integrates with these SportHub endpoints:

- `POST /api/agent-tools/create-event` - Create tournaments
- `POST /api/agent-tools/register-team` - Register teams
- `GET /api/agent-tools/events/{id}` - Get event details
- `GET /api/agent-tools/events/{id}/registration-status` - Check capacity
- `GET /api/agent-tools/events/{id}/can-register` - Validate registration
- `POST /api/agent-tools/events/{id}/generate-fixtures` - Generate schedule
- `GET /api/agent-tools/teams/{id}/fixtures` - Get team fixtures

All endpoints support:
- Age groups (U13, U15, U17, U19, Senior)
- Divisions (A, B)
- Smart fixture scheduling with constraints
- Multi-channel notifications (Email + WhatsApp)

## 📝 Usage Examples

### Team Registration Flow
```
User: "I want to register my U15 team"
Agent: "Great! I'll help you register. What's your team name?"
User: "Pretoria Eagles"
Agent: "And which school does Pretoria Eagles represent?"
User: "Pretoria High School"
Agent: "Perfect! Now I need the coach's information..."
```

### Event Creation Flow
```
User: "Create a soccer tournament for December 20th"
Agent: "I'll create a tournament for you. What would you like to call it?"
User: "Christmas Cup 2026"
Agent: "Perfect! Where will the Christmas Cup 2026 be held?"
User: "Main Stadium, Johannesburg"
Agent: "Great! How many teams can participate?"
```

## 📞 Monitoring & Support

### Monitoring

Monitor through:
- Bedrock console → Harness logs
- CloudWatch Logs (if configured)
- Your SportHub API logs

### Troubleshooting

1. **Gateway connection failed**: Check HTTPS URL and SSL certificate
2. **403 Forbidden**: Verify IAM permissions for Bedrock
3. **SCP denial**: Contact AWS org admin to update Service Control Policy
4. **API timeout**: Check API is running and accessible

## 🚀 Production Deployment Checklist

- [ ] Deploy API to production HTTPS endpoint
- [ ] Update OpenAPI schema with production URL
- [ ] Create Bedrock Harness with production instructions
- [ ] Configure Gateway with OpenAPI schema
- [ ] Test all agent functions in console
- [ ] Set up WhatsApp Business API integration
- [ ] Enable monitoring and alerts
- [ ] Document agent capabilities for users

## 🎊 AWS CDS Hackathon

This project is built for the AWS CDS Agentic AI Partner Hackathon.

See `aws-cds-integration.md` for hackathon-specific details.

## 📚 Additional Resources

- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [SportHub API Documentation](../src/SportHub/swagger)
