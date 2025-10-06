#!/bin/bash

# Webhook Endpoints Deployment Script
echo "🚀 Deploying Webhook Endpoints to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the webhook-endpoints directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod --yes

# Get the deployment URL
echo "✅ Deployment complete!"
echo "📋 Next steps:"
echo "1. Copy the deployment URL from above"
echo "2. Update your main app's environment variables with the webhook URLs"
echo "3. Redeploy your main application"
echo ""
echo "🔗 Webhook URLs to add to your main app:"
echo "WEBHOOK_BASE_URL=https://your-deployment-url.vercel.app"
echo "WEBHOOK_NEWS_FINDER=https://your-deployment-url.vercel.app/api/news"
echo "WEBHOOK_CONTENT_CREATION=https://your-deployment-url.vercel.app/api/content"
echo "WEBHOOK_NEWS_REJECTION=https://your-deployment-url.vercel.app/api/rejection"
echo "WEBHOOK_LINKEDIN_REMAKING=https://your-deployment-url.vercel.app/api/linkedin"
