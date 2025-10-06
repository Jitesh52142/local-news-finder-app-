# Vercel Deployment Guide

## Prerequisites
1. Vercel account (sign up at vercel.com)
2. MongoDB Atlas account (for database)
3. Git repository (GitHub, GitLab, or Bitbucket)

## Environment Variables
Set these in your Vercel dashboard under Project Settings > Environment Variables:

### Required Variables:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A strong random string for JWT token signing

### Optional Variables:
- `WEBHOOK_NEWS_FINDER`: URL for news finding webhook
- `WEBHOOK_CONTENT_CREATION`: URL for content creation webhook
- `WEBHOOK_NEWS_REJECTION`: URL for news rejection webhook
- `WEBHOOK_LINKEDIN_REMAKING`: URL for LinkedIn content remaking webhook
- `PORT`: Server port (defaults to 3000)

## Deployment Steps

### Method 1: Vercel CLI
1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to project directory: `cd AI_agent/AI_agent`
3. Login to Vercel: `vercel login`
4. Deploy: `vercel`
5. Follow the prompts to configure your project

### Method 2: GitHub Integration
1. Push your code to GitHub
2. Go to vercel.com and click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a Node.js project
5. Add environment variables in the dashboard
6. Click "Deploy"

## Project Structure
```
AI_agent/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── vercel.json        # Vercel configuration
├── models/            # Database models
├── routes/            # API routes
└── public/            # Static files (HTML, CSS, JS)
```

## Features
- ✅ User authentication (JWT-based)
- ✅ Chat history management
- ✅ AI-powered research insights
- ✅ LinkedIn post generation
- ✅ Rename/Delete chat functionality
- ✅ Edit keywords functionality
- ✅ Responsive design
- ✅ Real-time chat interface

## API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/chat/history/:userId` - Get chat history
- `GET /api/chat/session/:sessionId` - Get specific chat
- `POST /api/chat/initiate` - Start new chat
- `POST /api/chat/accept` - Accept content
- `POST /api/chat/decline` - Decline content with feedback
- `PUT /api/chat/rename/:sessionId` - Rename chat
- `DELETE /api/chat/delete/:sessionId` - Delete chat

## Troubleshooting
- Ensure all environment variables are set correctly
- Check MongoDB Atlas connection string format
- Verify webhook URLs are accessible (if using custom webhooks)
- Check Vercel function logs for any errors
