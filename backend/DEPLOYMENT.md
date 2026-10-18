# SportHub Deployment Guide

## 🌐 Live URLs
- **API**: https://sporthub-production.eba-rudr4swm.eu-west-1.elasticbeanstalk.com
- **Swagger**: https://sporthub-production.eba-rudr4swm.eu-west-1.elasticbeanstalk.com/swagger

## 🗄️ Database Configuration

### Local Development
- **Server**: localhost:3306
- **User**: root
- **Password**: (empty)
- **Database**: sporthub
- **Config File**: `appsettings.json`

### Production (AWS)
- **Server**: sporthub-db.cr422g0k08ae.eu-west-1.rds.amazonaws.com
- **User**: admin
- **Password**: SportHub2024!
- **Database**: sporthub
- **Config File**: `appsettings.Production.json`

## 🚀 How to Deploy New Changes

### Option 1: Using the Deploy Script (Easiest)
```bash
cd /Users/precious/Projects/SportHubRepo/backend
./deploy.sh
```

### Option 2: Manual Deployment
```bash
# 1. Navigate to project directory
cd /Users/precious/Projects/SportHubRepo/backend/src/SportHub

# 2. Build release version
dotnet publish -c Release -o ./aws-deploy --no-self-contained

# 3. Clean up unnecessary files
rm -f aws-deploy/SportHub
rm -rf aws-deploy/publish

# 4. Deploy to AWS
cd aws-deploy
eb deploy
```

## 📋 Deployment Checklist

Before deploying:
- ✅ Test locally with `dotnet run`
- ✅ Commit your changes to git
- ✅ Verify appsettings.Production.json has correct RDS connection
- ✅ Check that new features don't break existing APIs

After deploying:
- ✅ Test Swagger UI: https://sporthub-production.eba-rudr4swm.eu-west-1.elasticbeanstalk.com/swagger
- ✅ Test API endpoints
- ✅ Check logs: `cd aws-deploy && eb logs`

## 🔍 Monitoring & Troubleshooting

### View Logs
```bash
cd /Users/precious/Projects/SportHubRepo/backend/src/SportHub/aws-deploy
eb logs
```

### Check Environment Status
```bash
cd /Users/precious/Projects/SportHubRepo/backend/src/SportHub/aws-deploy
eb status
```

### View Environment Health
```bash
cd /Users/precious/Projects/SportHubRepo/backend/src/SportHub/aws-deploy
eb health
```

## 🎯 Git Workflow

### Deployed Branch
Currently deployed from: **develop** branch

### Recommended Workflow
1. Make changes in `develop` branch
2. Test locally
3. Deploy to AWS using deploy script
4. Once stable, merge to `main`

## 💰 AWS Resources Created

### Elastic Beanstalk
- **Application**: sporthub-api
- **Environment**: sporthub-production
- **Region**: eu-west-1 (Ireland)
- **Instance Type**: t3.micro (Free tier eligible)

### RDS MySQL Database
- **Instance ID**: sporthub-db
- **Instance Class**: db.t3.micro
- **Storage**: 20 GB
- **Region**: eu-west-1 (Ireland)
- **Cost**: ~$15/month (not free tier)

### S3 Bucket
- **Name**: elasticbeanstalk-eu-west-1-262683589693
- **Purpose**: Application versions storage

## 🔐 AWS Account Info
- **Account ID**: 262683589693
- **User**: hackerthon_user
- **Region**: eu-west-1

## ⚠️ Important Notes

1. **Database Credentials**: The RDS password is `SportHub2024!` - change it in production!
2. **Security Groups**: Already configured to allow EB → RDS communication
3. **SSL**: RDS requires SSL connection (already configured in connection string)
4. **Backups**: Currently disabled (backup-retention-period: 0) to save costs

## 🆘 Common Issues

### Issue: "Site can't be reached" or timeout
**Solution**: Check EB environment health and logs
```bash
cd aws-deploy && eb health && eb logs
```

### Issue: Database connection fails
**Solution**: 
1. Check RDS is running: AWS Console → RDS → Databases
2. Verify security groups allow EB → RDS
3. Test connection string in appsettings.Production.json

### Issue: Deploy fails
**Solution**:
1. Make sure you're in the correct directory
2. Clean and rebuild: `rm -rf aws-deploy && dotnet publish -c Release -o ./aws-deploy`
3. Check EB CLI is configured: `cd aws-deploy && eb status`

## 📞 Support
For deployment issues, check:
1. AWS Console → Elastic Beanstalk → sporthub-production
2. CloudWatch Logs
3. EB CLI logs: `eb logs`
