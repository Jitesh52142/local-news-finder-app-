const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const ChatSession = require('../models/Chat');
// Add authentication middleware here later if needed
const router = express.Router();

const WEBHOOKS = {
    NEWS_FINDER: process.env.WEBHOOK_NEWS_FINDER || 'https://mockapi.io/api/v1/research/news',
    CONTENT_CREATION: process.env.WEBHOOK_CONTENT_CREATION || 'https://mockapi.io/api/v1/research/content',
    NEWS_REJECTION: process.env.WEBHOOK_NEWS_REJECTION || 'https://mockapi.io/api/v1/research/rejection',
    LINKEDIN_REMAKING: process.env.WEBHOOK_LINKEDIN_REMAKING || 'https://mockapi.io/api/v1/research/linkedin'
};

// Helper to format responses from webhooks
const formatWebhookResponse = (data) => {
    if (typeof data === 'string') return formatTextForDisplay(data);
    if (data && typeof data === 'object') {
        if (data.output) return formatTextForDisplay(formatWebhookResponse(data.output));
        if (data.news) return formatTextForDisplay(formatWebhookResponse(data.news));
        if (data.post) return formatTextForDisplay(formatWebhookResponse(data.post));
        return formatTextForDisplay(JSON.stringify(data, null, 2));
    }
    return 'Invalid response format';
};

// Helper to format raw text into user-readable format
const formatTextForDisplay = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    // Remove extra whitespace and normalize line breaks
    let formatted = text.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Convert JSON-like structures to readable format
    if (formatted.startsWith('{') || formatted.startsWith('[')) {
        try {
            const parsed = JSON.parse(formatted);
            return formatObjectToText(parsed);
        } catch (e) {
            // If not valid JSON, continue with text formatting
        }
    }
    
    // Format as structured text
    formatted = formatted
        // Remove "Output:" prefix
        .replace(/^Output:\s*/gm, '')
        // Remove horizontal lines (---)
        .replace(/^---+$/gm, '')
        // Add proper paragraph breaks
        .replace(/\n\s*\n/g, '\n\n')
        // Format bullet points
        .replace(/^\s*[-*•]\s*/gm, '• ')
        // Format numbered lists
        .replace(/^\s*(\d+)[\.)]\s*/gm, '$1. ')
        // Add heading formatting for lines that end with colon
        .replace(/^([^:\n]+):$/gm, '**$1:**')
        // Format key-value pairs
        .replace(/^([^:\n]+):\s*(.+)$/gm, '**$1:** $2')
        // Ensure proper spacing around formatted elements
        .replace(/(\*\*[^*]+\*\*)/g, '\n$1\n')
        // Clean up extra newlines
        .replace(/\n{3,}/g, '\n\n');
    
    return formatted.trim();
};

// Helper to convert object/array to readable text
const formatObjectToText = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map((item, index) => {
            if (typeof item === 'object') {
                return `${index + 1}. ${formatObjectToText(item)}`;
            }
            return `• ${item}`;
        }).join('\n');
    }
    
    if (typeof obj === 'object' && obj !== null) {
        return Object.entries(obj).map(([key, value]) => {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            if (typeof value === 'object') {
                return `**${formattedKey}:**\n${formatObjectToText(value)}`;
            }
            return `**${formattedKey}:** ${value}`;
        }).join('\n\n');
    }
    
    return String(obj);
};

// Route to get chat history for a user
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const chatHistory = await ChatSession.find({ userId })
            .sort({ createdAt: -1 })
            .select('_id title createdAt isProcessing messages')
            .limit(50); // Limit to last 50 chats
        
        res.json(chatHistory);
    } catch (error) {
        res.status(500).json({ msg: 'Error fetching chat history', error: error.message });
    }
});

// Route to get a specific chat session
router.get('/session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const chatSession = await ChatSession.findById(sessionId);
        
        if (!chatSession) {
            return res.status(404).json({ msg: 'Chat session not found' });
        }
        
        res.json(chatSession);
    } catch (error) {
        res.status(500).json({ msg: 'Error fetching chat session', error: error.message });
    }
});

// Route to handle the initial user message
router.post('/initiate', async (req, res) => {
    const { keywords, userId } = req.body; // Assuming userId is sent from a logged-in user
    
    try {
        // Try to fetch from webhook first
        let newsContent;
        try {
            const response = await axios.post(WEBHOOKS.NEWS_FINDER, { keywords }, { timeout: 10000 });
            newsContent = formatWebhookResponse(response.data);
        } catch (webhookError) {
            console.log('Webhook failed, using fallback response:', webhookError.message);
            // Fallback response when webhook fails
            newsContent = `🔍 **Research Insights for: ${keywords}**

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

        // Create and save the new chat session
        const newChat = new ChatSession({
            userId,
            title: `Research on: ${keywords}`,
            isProcessing: true,
            messages: [
                { role: 'user', content: keywords },
                { role: 'bot', content: newsContent, contentType: 'news' }
            ]
        });
        await newChat.save();

        res.json(newChat);
    } catch (error) {
        console.error('Error in /initiate route:', error);
        res.status(500).json({ msg: 'Error creating chat session', error: error.message });
    }
});

// Route to handle accepting content
router.post('/accept', async (req, res) => {
    const { sessionId, lastMessageContent } = req.body;

    try {
        const response = await axios.post(WEBHOOKS.CONTENT_CREATION, { news: lastMessageContent });
        const postContent = formatWebhookResponse(response.data);

        const updatedChat = await ChatSession.findByIdAndUpdate(
            sessionId,
            { 
                $push: { 
                    messages: { role: 'bot', content: postContent, contentType: 'linkedin' } 
                },
                isProcessing: false // Process is complete now
            },
            { new: true }
        );
        res.json(updatedChat);

    } catch (error) {
        res.status(500).json({ msg: 'Error creating LinkedIn post', error: error.message });
    }
});

// Route to handle declining content and providing feedback
router.post('/decline', async (req, res) => {
    const { sessionId, feedback, lastMessage, messageId } = req.body;

    try {
        let webhookUrl;
        let payload;

        if (lastMessage.contentType === 'news') {
            webhookUrl = WEBHOOKS.NEWS_REJECTION;
            payload = { news: lastMessage.content, feedback };
        } else {
            webhookUrl = WEBHOOKS.LINKEDIN_REMAKING;
            payload = { post: lastMessage.content, feedback };
        }

        const response = await axios.post(webhookUrl, payload);
        const refinedContent = formatWebhookResponse(response.data);

        // Update the original message with feedback and add the new bot response
        const chat = await ChatSession.findById(sessionId);
        const messageToUpdate = chat.messages.id(messageId);
        if (messageToUpdate) {
            messageToUpdate.feedback.isDeclined = true;
            messageToUpdate.feedback.text = feedback;
            messageToUpdate.feedback.refinedContent = refinedContent;
        }

        chat.messages.push({
            role: 'bot',
            content: refinedContent,
            contentType: lastMessage.contentType
        });
        
        await chat.save();
        res.json(chat);

    } catch (error) {
        res.status(500).json({ msg: 'Error processing feedback', error: error.message });
    }
});

// Route to rename a chat session
router.put('/rename/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { title } = req.body;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            console.log('Invalid ObjectId format for rename:', sessionId);
            return res.status(400).json({ msg: 'Chat not found' });
        }

        if (!title || title.trim().length === 0) {
            return res.status(400).json({ msg: 'Title cannot be empty' });
        }

        const updatedChat = await ChatSession.findByIdAndUpdate(
            sessionId,
            { title: title.trim() },
            { new: true }
        );

        if (!updatedChat) {
            return res.status(404).json({ msg: 'Chat session not found' });
        }

        res.json({ msg: 'Chat renamed successfully', chat: updatedChat });
    } catch (error) {
        console.error('Rename chat error:', error);
        res.status(500).json({ msg: 'Error renaming chat', error: error.message });
    }
});

// Route to delete a chat session
router.delete('/delete/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            console.log('Invalid ObjectId format:', sessionId);
            return res.status(400).json({ msg: 'Chat not found' });
        }

        const deletedChat = await ChatSession.findByIdAndDelete(sessionId);

        if (!deletedChat) {
            console.log('Chat not found in database:', sessionId);
            return res.status(404).json({ msg: 'Chat not found' });
        }

        console.log('Chat deleted successfully:', sessionId);
        res.json({ msg: 'Chat deleted successfully' });
    } catch (error) {
        console.error('Delete chat error:', error);
        res.status(500).json({ msg: 'Error deleting chat', error: error.message });
    }
});

module.exports = router;