#!/bin/bash
# SportHub Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 Starting SportHub deployment..."

# Navigate to project directory
cd "$(dirname "$0")/src/SportHub"

echo "📦 Building Release version..."
dotnet publish -c Release -o ./aws-deploy --no-self-contained

echo "🧹 Cleaning up unnecessary files..."
rm -f aws-deploy/SportHub
rm -rf aws-deploy/publish

echo "☁️  Deploying to AWS Elastic Beanstalk..."
cd aws-deploy
eb deploy

echo "✅ Deployment complete!"
echo "🌐 URL: https://sporthub-production.eba-rudr4swm.eu-west-1.elasticbeanstalk.com"
echo "📖 Swagger: https://sporthub-production.eba-rudr4swm.eu-west-1.elasticbeanstalk.com/swagger"
