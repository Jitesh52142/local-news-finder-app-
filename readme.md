# Professional Research App

AI-Powered Insights for Consultancy

## Overview

The Professional Research App is a web application that helps consultants and professionals generate actionable business insights and professional LinkedIn posts using AI. Users can register, log in, and interact with an AI assistant to research topics and generate content.

## Features

- User registration and authentication (JWT-based)
- Secure password hashing
- AI-powered research insights and LinkedIn post generation
- Accept/decline workflow with feedback for content refinement
- Chat history and session management
- Responsive and modern UI

## Project Structure

```
professional-research-app/
│
├── models/           # Mongoose models (User, ChatSession)
├── public/           # Frontend static files (HTML, CSS, JS)
├── routes/           # Express route handlers (auth, chat)
├── server.js         # Main Express server
├── package.json      # Project dependencies and scripts
├── vercel.json       # Vercel deployment config
```

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd professional-research-app
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Configure MongoDB:**
   - Update the `dbURI` in [`server.js`](server.js) with your MongoDB connection string.

4. **Start the server:**
   ```sh
   npm start
   ```
   The app will run on [http://localhost:3000](http://localhost:3000).

### Usage

- Visit `/register.html` to create a new account.
- Log in via `/login.html`.
- Start a new chat, enter keywords, and interact with the AI assistant.
- Accept or decline AI-generated content and provide feedback for refinement.

## Deployment

This app is ready for deployment on [Vercel](https://vercel.com/) using the provided [`vercel.json`](vercel.json) configuration.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ai-agent)

### Manual Deployment

1. **Fork this repository** to your GitHub account
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your forked repository
3. **Set Environment Variables** in Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A strong random string for JWT signing
   - `WEBHOOK_*`: Optional webhook URLs for AI services
4. **Deploy**: Click "Deploy" and your app will be live!

### Environment Variables Required

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Technologies Used

- Node.js, Express.js
- MongoDB, Mongoose
- JWT for authentication
- bcryptjs for password hashing
- HTML, CSS, JavaScript (frontend)
- Axios for API/webhook calls

## License

MIT

---

**Note:**  
- Update the MongoDB URI and JWT secret for production use.
- Webhooks for AI content generation are configured