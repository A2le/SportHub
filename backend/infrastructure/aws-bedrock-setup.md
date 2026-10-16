# AWS Bedrock Harness Setup for SportHub

## Overview

SportHub uses the **new AWS Bedrock Harness with Gateway** approach (not the legacy Lambda proxy method).

The Gateway connects directly to your SportHub API using the OpenAPI schema.

## Prerequisites

1. AWS Account with Bedrock permissions
2. SportHub API running on a publicly accessible HTTPS URL
3. OpenAPI schema file (`sporthub-openapi.json`)

## Architecture

```
WhatsApp/User → Bedrock Harness → Gateway → SportHub API (HTTPS)
```

No Lambda function required! Gateway handles the API calls directly.

## Setup Steps

### 1. Deploy SportHub API to Public HTTPS Endpoint

Your API must be accessible via HTTPS (Bedrock requires HTTPS).

**Options:**
- AWS EC2 with SSL certificate
- AWS Elastic Beanstalk
- Temporary: ngrok for testing (`ngrok http 5178`)

### 2. Update OpenAPI Schema

Edit `sporthub-openapi.json` and replace the server URL:

```json
{
  "servers": [
    {
      "url": "https://your-api-domain.com",
      "description": "SportHub Production API"
    }
  ]
}
```

### 3. Create Bedrock Harness (AWS Console)

1. Go to **Amazon Bedrock** → **AgentCore** → **Harnesses**
2. Click **Create Harness**
3. Choose **Advanced Harness**
4. Configure:
   - **Name**: `sporthub-tournament-agent`
   - **Model**: Claude Sonnet 4.6
   - **Instructions**: Paste from `agent-instructions.md`

### 4. Add Gateway Target

1. In the Harness, click **Add Target**
2. Choose **Gateway**
3. Upload or paste `sporthub-openapi.json`
4. Verify all endpoints have `operationId` defined
5. Save the Gateway configuration

### 5. Test the Harness

1. Use the built-in Bedrock console test interface
2. Try sample queries:
   - "Create a soccer tournament for U13 and U15 teams"
   - "Register team Warriors FC for event ID 1"
   - "Generate fixtures for event 1"

## IAM Permissions Required

Your IAM user/role needs:

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

## Known Issues

### Organization SCP Blocking Bedrock

If you get `AccessDeniedException`, check for Service Control Policies:

```
arn:aws:organizations::ACCOUNT_ID:policy/SERVICE_CONTROL_POLICY_ID
```

Contact your AWS organization admin to allow Bedrock services.

## API Requirements

Gateway requires:
- ✅ HTTPS endpoint (not HTTP)
- ✅ OpenAPI 3.0+ schema
- ✅ All operations have `operationId`
- ✅ Valid JSON request/response schemas

## Environment Configuration

The API reads configuration from `appsettings.json`:

```json
{
  "AWS": {
    "Region": "eu-west-1"
  },
  "Email": {
    "FromEmail": "builders@umdoko.com"
  }
}
```

No additional environment variables needed for Gateway approach.

## Monitoring

Monitor your Harness through:
- Bedrock console → Harness logs
- CloudWatch Logs (if configured)
- Your SportHub API logs

## Next Steps

1. ✅ API deployed to HTTPS endpoint
2. ✅ OpenAPI schema updated with public URL
3. ✅ Harness created with Gateway target
4. ✅ Test basic queries in console
5. ✅ Integrate with WhatsApp for conversational registration
