# Getting Started with Echo Backend

Welcome! Your Echo app now has a complete backend server. This guide will get you up and running in minutes.

## Quick Start (Fastest Way)

### Option 1: Automated Setup

```bash
# Run the setup script
./setup-backend.sh

# Start backend (in one terminal)
cd server
npm run dev

# Start frontend (in another terminal)
npm run dev
```

### Option 2: Manual Setup

```bash
# Install backend dependencies
cd server
npm install

# Start backend server
npm run dev
```

In a new terminal:

```bash
# Start frontend (from root directory)
npm run dev
```

That's it! Your app is now running with:
- Frontend: http://localhost:5173 (or similar Vite port)
- Backend API: http://localhost:3001
- WebSocket: ws://localhost:3001/ws

## What's Been Added

### New Backend Server (`/server` directory)

```
server/
├── routes/               # API endpoints
│   ├── auth.js          # Login, signup, logout
│   ├── blog.js          # Blog CRUD operations
│   ├── notes.js         # Notes with sharing & comments
│   └── messages.js      # Real-time messaging
├── middleware/
│   └── auth.js          # JWT authentication
├── database.js          # SQLite database setup
├── server.js            # Main server with WebSocket
├── package.json         # Backend dependencies
└── .env                 # Configuration
```

### New Frontend API Service

```
src/app/services/api.ts  # Complete API client with:
  - authAPI             # Authentication
  - blogAPI             # Blog operations
  - notesAPI            # Notes operations
  - messagesAPI         # Messaging operations
  - wsClient            # WebSocket client
```

## Backend Features

✅ **Authentication**
- JWT-based auth with 7-day token expiration
- Secure password hashing with bcrypt
- Session management

✅ **Blog System**
- Create, read, update, delete posts
- Author tracking
- Timestamps

✅ **Notes System**
- Full CRUD operations
- Folder organization
- Share notes with other users
- Comments on notes
- Real-time collaboration ready

✅ **Messaging**
- WhatsApp-style conversations
- Real-time message delivery via WebSocket
- Online/offline status tracking
- Read receipts
- Typing indicators
- Unread message counts

✅ **Database**
- SQLite for easy local development
- Automatic table creation
- Foreign key constraints
- Can be upgraded to PostgreSQL for production

## Next Steps

### 1. Test the Backend

Open a new terminal and test the health endpoint:

```bash
curl http://localhost:3001/api/health
```

You should see: `{"status":"ok","message":"Echo backend is running"}`

### 2. Update Your Frontend Code

Replace localStorage calls with API calls. See `EXAMPLE_MIGRATION.md` for detailed examples.

Key file to update:
- `src/app/context/AuthContext.tsx` - Use `authAPI` instead of localStorage

### 3. Create Environment File (Optional)

Create `.env` in the root directory:

```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001/ws
```

## How the Backend Works

### 1. Authentication Flow

```
User Signs Up/Logs In
       ↓
Backend validates credentials
       ↓
JWT token generated
       ↓
Token sent to frontend
       ↓
Frontend stores token in localStorage
       ↓
Token included in all subsequent API requests (Authorization header)
       ↓
Backend verifies token on each request
```

### 2. Real-time Messaging Flow

```
User connects to app
       ↓
WebSocket connection established
       ↓
Client authenticates with JWT
       ↓
User online status updated in database
       ↓
User sends message
       ↓
Message saved to database
       ↓
Message sent via WebSocket to recipient (if online)
       ↓
Message delivered with read receipt
```

### 3. Data Flow Example (Blog Post)

```typescript
// User creates a post
const newPost = await blogAPI.create(title, content);

// Frontend request:
POST http://localhost:3001/api/blog
Headers: { Authorization: Bearer <token> }
Body: { title: "...", content: "..." }

// Backend:
1. Verifies JWT token
2. Extracts user ID from token
3. Creates post in database
4. Returns post with ID and timestamps

// Frontend:
1. Receives new post
2. Updates UI immediately
3. Post is now synced across all devices
```

## API Usage Examples

### Authentication

```typescript
import { authAPI } from './services/api';

// Sign up
const { user, token } = await authAPI.signup(email, password, name);

// Login
const { user, token } = await authAPI.login(email, password);

// Store token
localStorage.setItem('echo_user', JSON.stringify({ ...user, accessToken: token }));
```

### Blog Posts

```typescript
import { blogAPI } from './services/api';

// Get all posts
const posts = await blogAPI.getAll();

// Create post
const newPost = await blogAPI.create(title, content);

// Delete post
await blogAPI.delete(postId);
```

### Real-time Messaging

```typescript
import { messagesAPI, wsClient } from './services/api';

// Connect WebSocket
wsClient.connect(token);

// Listen for messages
wsClient.on('new_message', (data) => {
  console.log('New message:', data.message);
});

// Send message
const message = await messagesAPI.sendMessage(conversationId, content);
wsClient.sendMessage(conversationId, content, message);
```

## Troubleshooting

### Backend won't start

**Problem**: Port 3001 already in use

**Solution**:
```bash
# Kill the process using port 3001
# Mac/Linux:
lsof -ti :3001 | xargs kill -9

# Or change the port in server/.env
PORT=3002
```

### Frontend can't connect to backend

**Problem**: CORS errors or connection refused

**Solution**:
1. Make sure backend is running: `cd server && npm run dev`
2. Check the API URL in your code matches `http://localhost:3001`
3. Clear browser cache and reload

### Database errors

**Problem**: SQLite database is corrupted

**Solution**:
```bash
cd server
rm echo.db
npm run dev  # This will recreate the database
```

### WebSocket won't connect

**Problem**: WebSocket connection fails

**Solution**:
1. Verify backend is running
2. Check browser console for WebSocket errors
3. Make sure you're authenticating: `wsClient.connect(token)`
4. Try reconnecting after login

### Token expired errors

**Problem**: Getting 403 errors after some time

**Solution**:
- Tokens expire after 7 days
- Log out and log back in to get a new token
- Or implement token refresh logic

## Development Tips

### Running Both Servers Easily

**Option 1: Split Terminal in VS Code**
- Press `Ctrl+Shift+5` (or `Cmd+Shift+5` on Mac)
- Left terminal: `cd server && npm run dev`
- Right terminal: `npm run dev`

**Option 2: Multiple Terminal Tabs**
- Open two terminal tabs
- Tab 1: Backend
- Tab 2: Frontend

### Watching for Changes

Both servers support hot reload:
- Backend: Changes to `.js` files restart the server automatically
- Frontend: Vite hot module replacement updates instantly

### Debugging

**Backend**:
```bash
# Add console.log anywhere in server code
console.log('User data:', user);
```

**Frontend**:
```javascript
// Check API responses in browser DevTools
console.log('API response:', await blogAPI.getAll());
```

**Database**:
```bash
# Open SQLite database
cd server
sqlite3 echo.db

# Run queries
sqlite> SELECT * FROM users;
sqlite> .quit
```

## Important Files

| File | Purpose |
|------|---------|
| `server/server.js` | Main backend server |
| `server/database.js` | Database schema |
| `server/routes/*` | API endpoints |
| `src/app/services/api.ts` | Frontend API client |
| `src/app/context/AuthContext.tsx` | Authentication state |
| `BACKEND_INTEGRATION.md` | Detailed integration guide |
| `EXAMPLE_MIGRATION.md` | Code migration examples |

## Security Notes

⚠️ **For Development Only**

The current setup is for local development. Before deploying to production:

1. Change `JWT_SECRET` to a strong, random value
2. Use HTTPS/WSS instead of HTTP/WS
3. Add rate limiting
4. Implement input validation
5. Use environment variables for secrets
6. Consider upgrading to PostgreSQL
7. Add proper error logging
8. Implement token refresh

## What's Next?

1. ✅ Backend is running
2. ⬜ Update AuthContext to use API
3. ⬜ Update BlogPage to use API
4. ⬜ Update NotesPage to use API
5. ⬜ Update ChatPage with WebSocket
6. ⬜ Test all features
7. ⬜ Deploy to production

See `EXAMPLE_MIGRATION.md` for code examples on updating your components.

## Need Help?

- **API Documentation**: See `server/README.md`
- **Code Examples**: See `EXAMPLE_MIGRATION.md`
- **Integration Details**: See `BACKEND_INTEGRATION.md`
- **Database Schema**: Check `server/database.js`

Happy coding! 🚀
