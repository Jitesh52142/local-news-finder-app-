// Test script for webhook endpoints
const axios = require('axios');

const WEBHOOK_BASE_URL = process.env.WEBHOOK_BASE_URL || 'http://localhost:3001';

async function testWebhooks() {
    console.log('🧪 Testing Webhook Endpoints...\n');

    const tests = [
        {
            name: 'News Research',
            url: `${WEBHOOK_BASE_URL}/api/news`,
            data: {
                keywords: 'artificial intelligence',
                timestamp: new Date().toISOString(),
                source: 'test-script'
            }
        },
        {
            name: 'Content Creation',
            url: `${WEBHOOK_BASE_URL}/api/content`,
            data: {
                type: 'blog',
                data: 'test content for AI research',
                timestamp: new Date().toISOString(),
                source: 'test-script'
            }
        },
        {
            name: 'News Rejection',
            url: `${WEBHOOK_BASE_URL}/api/rejection`,
            data: {
                sessionId: 'test-session-123',
                feedback: 'Content needs more detail',
                timestamp: new Date().toISOString(),
                source: 'test-script'
            }
        },
        {
            name: 'LinkedIn Creation',
            url: `${WEBHOOK_BASE_URL}/api/linkedin`,
            data: {
                content: 'AI research insights for business growth',
                style: 'professional',
                timestamp: new Date().toISOString(),
                source: 'test-script'
            }
        },
        {
            name: 'Health Check',
            url: `${WEBHOOK_BASE_URL}/api/health`,
            method: 'GET'
        }
    ];

    for (const test of tests) {
        try {
            console.log(`Testing ${test.name}...`);
            
            const response = test.method === 'GET' 
                ? await axios.get(test.url)
                : await axios.post(test.url, test.data);
            
            console.log(`✅ ${test.name}: ${response.status} - ${response.data.success ? 'Success' : 'Failed'}`);
            
            if (test.name === 'Health Check') {
                console.log(`   Status: ${response.data.status}`);
            } else {
                console.log(`   Response keys: ${Object.keys(response.data).join(', ')}`);
            }
            
        } catch (error) {
            console.log(`❌ ${test.name}: ${error.response?.status || 'Connection Error'} - ${error.message}`);
        }
        
        console.log('');
    }

    console.log('🎯 Test completed!');
}

// Run tests
testWebhooks().catch(console.error);
