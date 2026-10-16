# WhatsApp & SES Setup Instructions

## ✅ What You Need to Update in appsettings.json

Replace these values in `/backend/src/SportHub/appsettings.json`:

```json
{
  "Email": {
    "FromEmail": "YOUR_VERIFIED_EMAIL@gmail.com",  // ← Replace with your verified SES email
    "FromName": "SportHub Tournament Manager",
    "UseTestMode": false
  },
  "WhatsApp": {
    "BusinessAccountId": "YOUR_WHATSAPP_BUSINESS_ACCOUNT_ID",  // ← From Meta Developer Console
    "PhoneNumberId": "YOUR_PHONE_NUMBER_ID",  // ← From Meta Developer Console
    "AccessToken": "YOUR_WHATSAPP_ACCESS_TOKEN",  // ← From Meta Developer Console
    "UseTestMode": true
  },
  "AWS": {
    "Region": "eu-west-1",
    "Profile": "default"
  }
}
```

## 📧 AWS SES Setup Steps

### 1. Verify Your Email
- Go to AWS Console → SES (Simple Email Service)
- Click "Verified identities" → "Create identity"
- Select "Email address"
- Enter your email
- Check your inbox and click verification link

### 2. Configure AWS Credentials (if not done)
```bash
aws configure
# Enter your AWS Access Key
# Enter your AWS Secret Key
# Region: eu-west-1
# Output format: json
```

### 3. Test SES Email
```bash
aws ses send-email \
  --from your-email@gmail.com \
  --destination ToAddresses=your-email@gmail.com \
  --message Subject={Data="Test"},Body={Text={Data="Test email from SportHub"}} \
  --region eu-west-1
```

## 📱 WhatsApp Business API Setup Steps

### 1. Create Meta Developer App
1. Go to https://developers.facebook.com
2. Click "My Apps" → "Create App"
3. Choose "Business" app type
4. Name: "SportHub Tournament Manager"

### 2. Add WhatsApp Product
1. In app dashboard, find "WhatsApp"
2. Click "Set up"
3. Select "WhatsApp Business API"

### 3. Get Your Credentials
Navigate to: **WhatsApp → API Setup**

You'll find:
- **Phone Number ID**: (example: `123456789012345`)
- **WhatsApp Business Account ID**: (example: `987654321098765`)
- **Access Token**: Click "Generate" for temporary token

### 4. Add Test Recipients
1. In WhatsApp settings, find "To" field
2. Click "Manage phone number list"
3. Add your phone number with country code (e.g., +27812345678)
4. Verify the code sent to your WhatsApp

### 5. Send Test Message
Use the Meta console to send a test message:
```
To: +27812345678
Message: Hello from SportHub!
```

## 🧪 Testing Your Setup

### Test SES Email Notification
```bash
curl -X POST http://localhost:5178/api/notifications/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@gmail.com",
    "subject": "Test Registration",
    "body": "Your team has been registered successfully!"
  }'
```

### Test WhatsApp Notification
```bash
curl -X POST http://localhost:5178/api/notifications/test-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+27812345678",
    "message": "Your team has been registered for the tournament!"
  }'
```

## 🚨 Common Issues

### SES "Email not verified"
- Make sure you clicked the verification link in your email
- Wait 5 minutes after verification
- Check spam folder

### SES "Sandbox mode"
- In sandbox, you can only send to verified emails
- Request production access in SES console
- Or verify both sender and recipient emails

### WhatsApp "Invalid phone number"
- Must include country code (+27 for South Africa)
- Must be added to test recipient list in Meta console
- Must have WhatsApp installed on that number

### WhatsApp "Access token expired"
- Temporary tokens expire in 24 hours
- Generate new token from Meta console
- Or create permanent token in app settings

## 📝 Next Steps

1. ✅ Update appsettings.json with your actual credentials
2. ✅ Run the API: `dotnet run`
3. ✅ Test email endpoint
4. ✅ Test WhatsApp endpoint
5. ✅ Integrate notifications into registration flow
