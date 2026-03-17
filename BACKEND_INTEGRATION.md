# Backend Integration Guide for Echo

This guide explains how to integrate and run the Echo backend server with your React application in VS Code.

## Overview

The Echo app now has a complete backend server that replaces localStorage with:
- **Database**: SQLite (easily upgradeable to PostgreSQL)
- **API**: RESTful Express.js endpoints
- **Real-time**: WebSocket server for live messaging
- **Authentication**: JWT-based auth system

## Quick Start

### 1. Install Backend Dependencies

Open a terminal in VS Code and run:

```bash
cd server
npm install
```

### 2. Start the Backend Server

From the `server` directory:

```bash
# Development mode (auto-reloads on changes)
npm run dev

# Or production mode
npm start
```

The server will start on `http://localhost:3001`

### 3. Start the Frontend

Open a second terminal and from the root directory:

```bash
npm run dev
```

Your React app will run on `http://localhost:5173` (or similar Vite port)

## Project Structure

```
echo/
├── server/                    # Backend server
│   ├── routes/               # API route handlers
│   │   ├── auth.js          # Authentication routes
│   │   ├── blog.js          # Blog post routes
│   │   ├── notes.js         # Notes routes
│   │   └── messages.js      # Messaging routes
│   ├── middleware/          # Express middleware
│   │   └── auth.js          # JWT authentication
│   ├── database.js          # SQLite database setup
│   ├── server.js            # Main server file
│   ├── package.json         # Backend dependencies
│   ├── .env                 # Environment variables
│   └── echo.db              # SQLite database (auto-created)
│
├── src/                      # React frontend
│   ├── app/
│   │   ├── services/
│   │   │   └── api.ts       # Backend API client
│   │   ├── context/
│   │   │   └── AuthContext.tsx  # Auth state management
│   │   └── ...
│   └── ...
└── package.json             # Frontend dependencies
```

## Environment Variables

### Backend (.env in server/)

```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

### Frontend (.env in root/)

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001/ws
```

## Using the API in Your Frontend

The `src/app/services/api.ts` file provides a complete API client. Here's how to use it:

### Authentication

```typescript
import { authAPI } from './services/api';

// Sign up
const result = await authAPI.signup(email, password, name);
// Returns: { user: {...}, token: "..." }

// Login
const result = await authAPI.login(email, password);
// Returns: { user: {...}, token: "..." }

// Logout
await authAPI.logout();
```

### Blog Posts

```typescript
import { blogAPI } from './services/api';

// Get all posts
const posts = await blogAPI.getAll();

// Create post
const newPost = await blogAPI.create(title, content);

// Update post
const updated = await blogAPI.update(postId, title, content);

// Delete post
await blogAPI.delete(postId);
```

### Notes

```typescript
import { notesAPI } from './services/api';

// Get all notes
const notes = await notesAPI.getAll();

// Create note
const note = await notesAPI.create(title, content, folder);

// Share note
await notesAPI.share(noteId, email, 'view'); // or 'edit'

// Add comment
await notesAPI.addComment(noteId, content);
```

### Messages (Real-time)

```typescript
import { messagesAPI, wsClient } from './services/api';

// Connect WebSocket
wsClient.connect(token);

// Get conversations
const conversations = await messagesAPI.getConversations();

// Get messages
const messages = await messagesAPI.getMessages(conversationId);

// Send message
const msg = await messagesAPI.sendMessage(conversationId, content);
wsClient.sendMessage(conversationId, content, msg);

// Listen for new messages
wsClient.on('new_message', (data) => {
  console.log('New message:', data.message);
});

// Listen for user status
wsClient.on('user_status', (data) => {
  console.log(`User ${data.userId} is ${data.isOnline ? 'online' : 'offline'}`);
});

// Send typing indicator
wsClient.sendTyping(conversationId, true);
```

## Updating Your AuthContext

Replace the localStorage-based auth in `src/app/context/AuthContext.tsx` with API calls:

```typescript
import { authAPI, wsClient } from '../services/api';

const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const { user, token } = await authAPI.login(email, password);

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      accessToken: token,
    };

    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('echo_user', JSON.stringify(userData));

    // Connect WebSocket
    wsClient.connect(token);

    return true;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};
```

## Development Workflow

### Running Both Servers

In VS Code, you can use the integrated terminal to run both servers:

1. **Split Terminal** (Ctrl+Shift+5 or Cmd+Shift+5 on Mac)
2. **Left Terminal**: `cd server && npm run dev`
3. **Right Terminal**: `npm run dev` (from root)

### Using VS Code Tasks (Optional)

Create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Backend",
      "type": "shell",
      "command": "npm run dev",
      "options": {
        "cwd": "${workspaceFolder}/server"
      },
      "problemMatcher": [],
      "isBackground": true
    },
    {
      "label": "Start Frontend",
      "type": "shell",
      "command": "npm run dev",
      "problemMatcher": [],
      "isBackground": true
    },
    {
      "label": "Start All",
      "dependsOn": ["Start Backend", "Start Frontend"],
      "problemMatcher": []
    }
  ]
}
```

Then run: **Terminal → Run Task → Start All**

## Testing the Backend

### Manual Testing with curl

```bash
# Health check
curl http://localhost:3001/api/health

# Sign up
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Testing WebSocket

Use a WebSocket client like [websocat](https://github.com/vi/websocat):

```bash
websocat ws://localhost:3001/ws
```

Then send:
```json
{"type":"auth","token":"your_jwt_token_here"}
```

## Troubleshooting

### Backend won't start

1. Check if port 3001 is already in use:
   ```bash
   lsof -i :3001  # Mac/Linux
   netstat -ano | findstr :3001  # Windows
   ```

2. Change the port in `server/.env`:
   ```env
   PORT=3002
   ```

### CORS errors

Make sure the backend has CORS enabled (already configured in `server.js`).

### WebSocket connection fails

1. Check that the backend is running
2. Verify the WebSocket URL in your `.env` file
3. Check browser console for connection errors

### Database errors

Delete `server/echo.db` and restart the server to recreate the database.

## Migration from localStorage

To migrate existing localStorage data to the backend:

1. Export localStorage data from browser console:
   ```javascript
   const data = {
     users: localStorage.getItem('echo_users'),
     notes: localStorage.getItem('echo_notes'),
     posts: localStorage.getItem('echo_blog_posts'),
     messages: localStorage.getItem('echo_messages')
   };
   console.log(JSON.stringify(data));
   ```

2. Create a migration script to import this data via API calls

## Production Deployment

For production, you'll want to:

1. **Use PostgreSQL** instead of SQLite
2. **Set secure environment variables**
3. **Enable HTTPS/WSS**
4. **Add rate limiting**
5. **Deploy backend separately** (Railway, Render, Heroku, etc.)
6. **Update frontend environment variables** to point to production API

See `server/README.md` for more details on production deployment.

## Next Steps

1. Replace localStorage calls in your React components with API calls
2. Implement error handling and loading states
3. Add offline support with service workers (optional)
4. Set up proper error boundaries
5. Add request retry logic for failed API calls

## Need Help?

- Check `server/README.md` for API documentation
- Review `src/app/services/api.ts` for API client usage
- Look at the example implementations in each route file
