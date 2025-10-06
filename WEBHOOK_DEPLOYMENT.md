# Webhook Endpoints Deployment Guide

This guide will help you deploy real webhook endpoints for your AI Agent application on Vercel.

## 🚀 Quick Setup

### Step 1: Deploy Webhook Endpoints

1. **Create a new Vercel project for webhook endpoints:**
   ```bash
   cd webhook-endpoints
   vercel --prod
   ```

2. **Note the deployment URL** (e.g., `https://your-webhook-endpoints.vercel.app`)

### Step 2: Update Environment Variables

In your main AI Agent Vercel project, add these environment variables:

```bash
# Webhook Configuration
WEBHOOK_BASE_URL=https://your-webhook-endpoints.vercel.app
WEBHOOK_NEWS_FINDER=https://your-webhook-endpoints.vercel.app/api/news
WEBHOOK_CONTENT_CREATION=https://your-webhook-endpoints.vercel.app/api/content
WEBHOOK_NEWS_REJECTION=https://your-webhook-endpoints.vercel.app/api/rejection
WEBHOOK_LINKEDIN_REMAKING=https://your-webhook-endpoints.vercel.app/api/linkedin

# Environment
NODE_ENV=production
```

### Step 3: Deploy Main Application

```bash
cd ..
vercel --prod
```

## 🔧 Manual Setup

### Option 1: Deploy Webhook Endpoints Separately

1. **Create new Vercel project:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import the `webhook-endpoints` folder
   - Deploy

2. **Update main app environment variables:**
   - Go to your main project settings
   - Add the webhook URLs as environment variables
   - Redeploy

### Option 2: Use External Webhook Services

Replace the webhook URLs with your preferred services:

```javascript
// In config/webhooks.js
PRODUCTION: {
    NEWS_FINDER: 'https://your-news-api.com/research',
    CONTENT_CREATION: 'https://your-content-api.com/generate',
    NEWS_REJECTION: 'https://your-feedback-api.com/process',
    LINKEDIN_REMAKING: 'https://your-linkedin-api.com/create'
}
```

## 🧪 Testing

### Test Webhook Endpoints

```bash
# Test news endpoint
curl -X POST https://your-webhook-endpoints.vercel.app/api/news \
  -H "Content-Type: application/json" \
  -d '{"keywords": "artificial intelligence", "timestamp": "2024-01-01T00:00:00Z", "source": "test"}'

# Test content endpoint
curl -X POST https://your-webhook-endpoints.vercel.app/api/content \
  -H "Content-Type: application/json" \
  -d '{"type": "blog", "data": "test content", "timestamp": "2024-01-01T00:00:00Z", "source": "test"}'

# Test health check
curl https://your-webhook-endpoints.vercel.app/api/health
```

### Test Main Application

1. Visit your deployed app
2. Enter keywords for research
3. Check that webhook calls are working
4. Verify fallback responses when webhooks fail

## 📊 Monitoring

### Vercel Function Logs

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Functions" tab
4. Monitor webhook endpoint logs

### Environment Variables

Make sure all required environment variables are set:

- `WEBHOOK_BASE_URL`
- `WEBHOOK_NEWS_FINDER`
- `WEBHOOK_CONTENT_CREATION`
- `WEBHOOK_NEWS_REJECTION`
- `WEBHOOK_LINKEDIN_REMAKING`
- `NODE_ENV=production`

## 🔄 Fallback System

The application includes a robust fallback system:

- **Webhook fails**: Uses AI-generated sample content
- **Timeout**: 10-second timeout with fallback
- **Network error**: Graceful error handling
- **Invalid response**: Fallback content generation

## 🛠️ Customization

### Custom Webhook Responses

Edit `webhook-endpoints/index.js` to customize:

- AI response generation
- Content formatting
- Error handling
- Response structure

### Custom Fallback Content

Edit `services/webhookService.js` to customize:

- Fallback response templates
- Error messages
- Content formatting
- Retry logic

## 📝 API Endpoints

### News Research
- **URL**: `/api/news`
- **Method**: POST
- **Body**: `{ keywords, timestamp, source }`

### Content Creation
- **URL**: `/api/content`
- **Method**: POST
- **Body**: `{ type, data, timestamp, source }`

### News Rejection
- **URL**: `/api/rejection`
- **Method**: POST
- **Body**: `{ sessionId, feedback, timestamp, source }`

### LinkedIn Creation
- **URL**: `/api/linkedin`
- **Method**: POST
- **Body**: `{ content, style, timestamp, source }`

### Health Check
- **URL**: `/api/health`
- **Method**: GET

## 🚨 Troubleshooting

### Common Issues

1. **Webhook timeout**: Check network connectivity
2. **Invalid response**: Verify webhook endpoint format
3. **Environment variables**: Ensure all are set correctly
4. **CORS errors**: Check webhook endpoint CORS settings

### Debug Steps

1. Check Vercel function logs
2. Test webhook endpoints directly
3. Verify environment variables
4. Check network connectivity
5. Review error messages in browser console

## 📈 Performance

### Optimization Tips

1. **Caching**: Implement response caching
2. **Rate limiting**: Add rate limiting to webhooks
3. **Monitoring**: Set up performance monitoring
4. **Scaling**: Configure auto-scaling for high traffic

## 🔐 Security

### Security Considerations

1. **API Keys**: Secure webhook API keys
2. **Rate Limiting**: Implement rate limiting
3. **Validation**: Validate all input data
4. **Logging**: Monitor for suspicious activity
5. **HTTPS**: Ensure all endpoints use HTTPS

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review Vercel function logs
3. Test webhook endpoints individually
4. Verify environment variable configuration
5. Check network connectivity

## 🎯 Next Steps

After successful deployment:

1. Monitor webhook performance
2. Customize response templates
3. Add additional webhook endpoints
4. Implement caching strategies
5. Set up monitoring and alerts
