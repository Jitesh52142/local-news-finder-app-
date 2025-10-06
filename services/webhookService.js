const axios = require('axios');

class WebhookService {
    constructor() {
        this.baseUrl = process.env.WEBHOOK_BASE_URL || 'https://api.webhook.site';
        this.timeout = 10000; // 10 seconds
    }

    // News Research Webhook
    async fetchNewsInsights(keywords) {
        try {
            const response = await axios.post(`${this.baseUrl}/news-research`, {
                keywords: keywords,
                timestamp: new Date().toISOString(),
                source: 'ai-agent-app'
            }, { timeout: this.timeout });

            return this.formatNewsResponse(response.data);
        } catch (error) {
            console.error('News webhook error:', error.message);
            return this.getFallbackNewsResponse(keywords);
        }
    }

    // Content Creation Webhook
    async createContent(contentType, data) {
        try {
            const response = await axios.post(`${this.baseUrl}/content-creation`, {
                type: contentType,
                data: data,
                timestamp: new Date().toISOString(),
                source: 'ai-agent-app'
            }, { timeout: this.timeout });

            return this.formatContentResponse(response.data);
        } catch (error) {
            console.error('Content creation webhook error:', error.message);
            return this.getFallbackContentResponse(contentType, data);
        }
    }

    // News Rejection Webhook
    async handleNewsRejection(sessionId, feedback) {
        try {
            const response = await axios.post(`${this.baseUrl}/news-rejection`, {
                sessionId: sessionId,
                feedback: feedback,
                timestamp: new Date().toISOString(),
                source: 'ai-agent-app'
            }, { timeout: this.timeout });

            return response.data;
        } catch (error) {
            console.error('News rejection webhook error:', error.message);
            return { success: false, message: 'Failed to process rejection feedback' };
        }
    }

    // LinkedIn Post Creation Webhook
    async createLinkedInPost(content, style = 'professional') {
        try {
            const response = await axios.post(`${this.baseUrl}/linkedin-creation`, {
                content: content,
                style: style,
                timestamp: new Date().toISOString(),
                source: 'ai-agent-app'
            }, { timeout: this.timeout });

            return this.formatLinkedInResponse(response.data);
        } catch (error) {
            console.error('LinkedIn webhook error:', error.message);
            return this.getFallbackLinkedInResponse(content);
        }
    }

    // Format responses
    formatNewsResponse(data) {
        if (typeof data === 'string') return data;
        if (data && typeof data === 'object') {
            if (data.insights) return data.insights;
            if (data.news) return data.news;
            if (data.output) return data.output;
            return JSON.stringify(data, null, 2);
        }
        return 'Invalid response format';
    }

    formatContentResponse(data) {
        if (typeof data === 'string') return data;
        if (data && typeof data === 'object') {
            if (data.content) return data.content;
            if (data.output) return data.output;
            return JSON.stringify(data, null, 2);
        }
        return 'Invalid content response';
    }

    formatLinkedInResponse(data) {
        if (typeof data === 'string') return data;
        if (data && typeof data === 'object') {
            if (data.post) return data.post;
            if (data.content) return data.content;
            if (data.output) return data.output;
            return JSON.stringify(data, null, 2);
        }
        return 'Invalid LinkedIn response';
    }

    // Fallback responses
    getFallbackNewsResponse(keywords) {
        return `🔍 **Research Insights for: ${keywords}**

**Market Analysis:**
• Current trends in ${keywords} show significant growth potential
• Key players are investing heavily in this space
• Consumer demand is increasing by 15-20% annually

**Key Opportunities:**
• Emerging technologies are creating new possibilities
• Market gaps present untapped potential
• Strategic partnerships could accelerate growth

**Risk Factors:**
• Regulatory changes may impact the sector
• Competition is intensifying rapidly
• Economic conditions could affect adoption

**Recommendations:**
• Focus on innovation and differentiation
• Build strong customer relationships
• Monitor market trends closely
• Consider strategic partnerships

*Note: This is a sample response. For real-time data, please ensure webhook configuration is properly set up.*`;
    }

    getFallbackContentResponse(contentType, data) {
        return `📝 **Generated ${contentType} Content**

Based on your input, here's a professional ${contentType}:

**Content Preview:**
This is a sample ${contentType} generated based on your requirements. The content has been structured to be engaging and professional.

**Key Points:**
• Professional tone and structure
• Engaging and informative content
• Optimized for your target audience
• Ready for immediate use

*Note: This is a sample response. For real-time content generation, please ensure webhook configuration is properly set up.*`;
    }

    getFallbackLinkedInResponse(content) {
        return `💼 **Professional LinkedIn Post**

**Post Content:**
${content}

**Post Features:**
• Professional tone and structure
• Engaging call-to-action
• Industry-relevant hashtags
• Optimized for LinkedIn algorithm

**Suggested Hashtags:**
#BusinessInsights #ProfessionalGrowth #IndustryTrends #Networking

*Note: This is a sample response. For real-time LinkedIn post generation, please ensure webhook configuration is properly set up.*`;
    }
}

module.exports = new WebhookService();
