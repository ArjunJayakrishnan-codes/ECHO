# Echo Backend Server

Node.js/Express backend with WebSocket support for the Echo application.

## Features

- JWT authentication
- RESTful API endpoints
- Real-time messaging via WebSockets
- SQLite database (can be upgraded to PostgreSQL)
- User status tracking (online/offline)
- Blog posts management
- Notes with sharing and comments
- Direct messaging with read receipts

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Configure environment:
```bash
# Copy .env.example to .env and update values
cp .env.example .env
```

3. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3001` by default.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Blog Posts
- `GET /api/blog` - Get all blog posts
- `GET /api/blog/:id` - Get single blog post
- `POST /api/blog` - Create blog post
- `PUT /api/blog/:id` - Update blog post
- `DELETE /api/blog/:id` - Delete blog post

### Notes
- `GET /api/notes` - Get all notes
- `GET /api/notes/:id` - Get single note
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `POST /api/notes/:id/share` - Share note
- `POST /api/notes/:id/comments` - Add comment

### Messages
- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/conversations/:id` - Get messages in conversation
- `POST /api/messages/conversations/:id/messages` - Send message
- `POST /api/messages/conversations` - Create conversation
- `GET /api/messages/users` - Get all users (contacts)
- `PUT /api/messages/conversations/:id/read` - Mark messages as read

## WebSocket Events

Connect to `ws://localhost:3001/ws`

### Client -> Server
```json
// Authenticate
{ "type": "auth", "token": "jwt_token" }

// Send message
{ "type": "message", "conversationId": "conv-123", "content": "Hello" }

// Typing indicator
{ "type": "typing", "conversationId": "conv-123", "isTyping": true }
```

### Server -> Client
```json
// Authentication result
{ "type": "auth", "success": true }

// New message
{ "type": "new_message", "conversationId": "conv-123", "message": {...} }

// User status
{ "type": "user_status", "userId": "user-123", "isOnline": true }

// Typing indicator
{ "type": "typing", "conversationId": "conv-123", "userId": "user-123", "isTyping": true }
```

## Database

The app uses SQLite for local development. The database file `echo.db` is created automatically when the server starts.

### Tables
- `users` - User accounts
- `user_status` - Online/offline status
- `blog_posts` - Blog content
- `notes` - Note documents
- `note_shares` - Note sharing permissions
- `note_comments` - Comments on notes
- `conversations` - Message conversations
- `messages` - Chat messages

## Upgrading to PostgreSQL

To use PostgreSQL instead of SQLite:

1. Install pg: `npm install pg`
2. Replace `better-sqlite3` with PostgreSQL connection
3. Update database.js with PostgreSQL queries
4. Update environment variables with database connection string

## Security Notes

- Change `JWT_SECRET` in production
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Add input validation and sanitization
- Use secure WebSocket (wss://) in production
