// Webhook Configuration for Vercel Deployment
module.exports = {
    // Production webhook URLs (replace with your actual webhook endpoints)
    PRODUCTION: {
        NEWS_FINDER: process.env.WEBHOOK_NEWS_FINDER || 'https://your-news-webhook.vercel.app/api/news',
        CONTENT_CREATION: process.env.WEBHOOK_CONTENT_CREATION || 'https://your-content-webhook.vercel.app/api/content',
        NEWS_REJECTION: process.env.WEBHOOK_NEWS_REJECTION || 'https://your-rejection-webhook.vercel.app/api/rejection',
        LINKEDIN_REMAKING: process.env.WEBHOOK_LINKEDIN_REMAKING || 'https://your-linkedin-webhook.vercel.app/api/linkedin'
    },
    
    // Development webhook URLs (for local testing)
    DEVELOPMENT: {
        NEWS_FINDER: 'http://localhost:3001/api/news',
        CONTENT_CREATION: 'http://localhost:3001/api/content',
        NEWS_REJECTION: 'http://localhost:3001/api/rejection',
        LINKEDIN_REMAKING: 'http://localhost:3001/api/linkedin'
    },
    
    // Mock webhook URLs (fallback)
    MOCK: {
        NEWS_FINDER: 'https://mockapi.io/api/v1/research/news',
        CONTENT_CREATION: 'https://mockapi.io/api/v1/research/content',
        NEWS_REJECTION: 'https://mockapi.io/api/v1/research/rejection',
        LINKEDIN_REMAKING: 'https://mockapi.io/api/v1/research/linkedin'
    },
    
    // Get current environment webhooks
    getCurrentWebhooks() {
        const env = process.env.NODE_ENV || 'development';
        return env === 'production' ? this.PRODUCTION : this.DEVELOPMENT;
    },
    
    // Webhook timeout settings
    TIMEOUT: 10000, // 10 seconds
    
    // Retry settings
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
};
