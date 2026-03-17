# Quick Reference Card

## Starting the Servers

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
npm run dev
```

## Common Commands

### Backend
```bash
cd server
npm install          # Install dependencies
npm run dev          # Start with auto-reload
npm start           # Start production mode
```

### Database
```bash
cd server
sqlite3 echo.db                    # Open database
sqlite> SELECT * FROM users;       # Query users
sqlite> .schema                    # Show schema
sqlite> .quit                      # Exit

rm echo.db && npm run dev          # Reset database
```

## API Quick Reference

### Authentication
```typescript
import { authAPI } from './services/api';

// Signup
const { user, token } = await authAPI.signup(email, password, name);

// Login
const { user, token } = await authAPI.login(email, password);

// Logout
await authAPI.logout();
```

### Blog
```typescript
import { blogAPI } from './services/api';

// Get all posts
const posts = await blogAPI.getAll();

// Create post
const post = await blogAPI.create(title, content);

// Update post
const updated = await blogAPI.update(id, title, content);

// Delete post
await blogAPI.delete(id);
```

### Notes
```typescript
import { notesAPI } from './services/api';

// Get all notes
const notes = await notesAPI.getAll();

// Create note
const note = await notesAPI.create(title, content, folder);

// Update note
const updated = await notesAPI.update(id, title, content, folder);

// Delete note
await notesAPI.delete(id);

// Share note
await notesAPI.share(id, email, 'view');

// Add comment
const comment = await notesAPI.addComment(id, content);
```

### Messages
```typescript
import { messagesAPI, wsClient } from './services/api';

// Get conversations
const convos = await messagesAPI.getConversations();

// Get messages
const messages = await messagesAPI.getMessages(conversationId);

// Send message
const msg = await messagesAPI.sendMessage(conversationId, content);

// Create conversation
const convo = await messagesAPI.createConversation(email);

// Get users
const users = await messagesAPI.getUsers();

// Mark as read
await messagesAPI.markAsRead(conversationId);
```

### WebSocket
```typescript
import { wsClient } from './services/api';

// Connect
wsClient.connect(token);

// Disconnect
wsClient.disconnect();

// Listen for messages
wsClient.on('new_message', (data) => {
  console.log(data.message);
});

// Listen for user status
wsClient.on('user_status', (data) => {
  console.log(`${data.userId} is ${data.isOnline ? 'online' : 'offline'}`);
});

// Listen for typing
wsClient.on('typing', (data) => {
  console.log(`${data.userId} is typing: ${data.isTyping}`);
});

// Send message (after API call)
wsClient.sendMessage(conversationId, content, message);

// Send typing indicator
wsClient.sendTyping(conversationId, true);
```

## Common Patterns

### Loading State Pattern
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    setLoading(true);
    const result = await api.getData();
    setData(result);
    setError(null);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### Optimistic Update Pattern
```typescript
const handleCreate = async (item) => {
  // Optimistic update
  const tempId = `temp-${Date.now()}`;
  setItems(prev => [...prev, { ...item, id: tempId }]);

  try {
    const newItem = await api.create(item);
    // Replace temp item with real one
    setItems(prev => prev.map(i => i.id === tempId ? newItem : i));
  } catch (err) {
    // Rollback on error
    setItems(prev => prev.filter(i => i.id !== tempId));
    showError(err.message);
  }
};
```

### WebSocket Integration Pattern
```typescript
useEffect(() => {
  // Connect
  const user = JSON.parse(localStorage.getItem('echo_user'));
  if (user?.accessToken) {
    wsClient.connect(user.accessToken);
  }

  // Set up listeners
  const handleMessage = (data) => {
    setMessages(prev => [...prev, data.message]);
  };

  wsClient.on('new_message', handleMessage);

  // Cleanup
  return () => {
    wsClient.off('new_message', handleMessage);
  };
}, []);
```

## API Endpoints

```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout

GET    /api/blog
GET    /api/blog/:id
POST   /api/blog
PUT    /api/blog/:id
DELETE /api/blog/:id

GET    /api/notes
GET    /api/notes/:id
POST   /api/notes
PUT    /api/notes/:id
DELETE /api/notes/:id
POST   /api/notes/:id/share
POST   /api/notes/:id/comments

GET    /api/messages/conversations
GET    /api/messages/conversations/:id
POST   /api/messages/conversations/:id/messages
POST   /api/messages/conversations
GET    /api/messages/users
PUT    /api/messages/conversations/:id/read
```

## Environment Variables

### Frontend (.env in root)
```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001/ws
```

### Backend (server/.env)
```env
PORT=3001
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## Troubleshooting

### Port in use
```bash
# Mac/Linux
lsof -ti :3001 | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Database reset
```bash
cd server
rm echo.db
npm run dev
```

### Clear all data
```bash
# Backend
cd server
rm echo.db

# Frontend
localStorage.clear()  # In browser console
```

### Check backend status
```bash
curl http://localhost:3001/api/health
```

## File Locations

```
Key Files:
├── server/
│   ├── server.js              # Main server
│   ├── database.js            # DB setup
│   ├── routes/
│   │   ├── auth.js           # Auth endpoints
│   │   ├── blog.js           # Blog endpoints
│   │   ├── notes.js          # Notes endpoints
│   │   └── messages.js       # Message endpoints
│   └── .env                   # Config
│
├── src/app/
│   ├── services/
│   │   └── api.ts            # API client
│   ├── context/
│   │   └── AuthContext.tsx   # Auth state
│   └── pages/
│       ├── BlogPage.tsx
│       ├── NotesPage.tsx
│       └── ChatPage.tsx
│
└── Documentation:
    ├── GETTING_STARTED.md
    ├── BACKEND_INTEGRATION.md
    ├── EXAMPLE_MIGRATION.md
    ├── ARCHITECTURE.md
    └── INTEGRATION_CHECKLIST.md
```

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 401  | Unauthorized | Login again |
| 403  | Forbidden | Check permissions |
| 404  | Not Found | Check resource ID |
| 500  | Server Error | Check backend logs |

## Database Tables

```
users            - User accounts
user_status      - Online/offline status
blog_posts       - Blog content
notes            - Note documents
note_shares      - Sharing permissions
note_comments    - Note comments
conversations    - Chat conversations
messages         - Chat messages
```

## Need More Help?

- **Getting Started**: See `GETTING_STARTED.md`
- **Code Examples**: See `EXAMPLE_MIGRATION.md`
- **API Docs**: See `server/README.md`
- **Architecture**: See `ARCHITECTURE.md`
- **Checklist**: See `INTEGRATION_CHECKLIST.md`
