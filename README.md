# Echo - Full-Stack Blogging, Notes & Messaging Platform

Echo is a comprehensive web application that combines blogging, note-taking, and personal messaging into one unified platform. Built with React, Node.js, and featuring real-time collaboration capabilities.

## Features

### 🌐 Blogging
- Create, read, update, and delete blog posts
- Rich text editing
- Author attribution
- Timestamped entries

### 📝 Notes
- Full-featured note editor with rich text formatting
- Organize notes into folders
- Share notes with other users (view/edit permissions)
- Collaborative comments
- Real-time collaboration support

### 💬 Messaging
- WhatsApp-style instant messaging
- Real-time message delivery
- Online/offline status indicators
- Typing indicators
- Read receipts
- Unread message counts
- Contact list

### 🎨 Design
- Modern Figma-style interface
- Indigo/purple gradient theme
- Glassmorphic effects
- Fully responsive design
- Dark mode support

## Technology Stack

### Frontend
- **React** 18.3 with TypeScript
- **Vite** for fast development
- **TailwindCSS** v4 for styling
- **React Router** for navigation
- **React Quill** for rich text editing
- **WebSocket** for real-time features

### Backend
- **Node.js** with Express
- **SQLite** (development) / **PostgreSQL** (production)
- **JWT** authentication
- **bcrypt** for password hashing
- **WebSocket** server for real-time messaging
- **RESTful API** architecture

## Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ArjunJayakrishnan-codes/ECHO.git
   cd echo
   ```

2. **Run the setup script**
   ```bash
   ./setup-backend.sh
   ```

3. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```

4. **Start the frontend** (in a new terminal)
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

That's it! You're ready to use Echo.

## Project Structure

```
echo/
├── server/                    # Backend Node.js server
│   ├── routes/               # API route handlers
│   ├── middleware/           # Express middleware
│   ├── database.js           # Database setup
│   ├── server.js             # Main server file
│   ├── package.json          # Backend dependencies
│   └── .env                  # Environment configuration
│
├── src/                      # Frontend React app
│   ├── app/
│   │   ├── components/      # React components
│   │   ├── context/         # Context providers
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── App.tsx          # Root component
│   └── styles/              # Global styles
│
├── public/                   # Static assets
├── docs/                     # Documentation
└── package.json             # Frontend dependencies
```

## Documentation

Comprehensive documentation is available in the project:

- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Quick start guide and setup instructions
- **[BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md)** - Detailed backend integration guide
- **[EXAMPLE_MIGRATION.md](EXAMPLE_MIGRATION.md)** - Code examples for migrating from localStorage
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and data flow diagrams
- **[INTEGRATION_CHECKLIST.md](INTEGRATION_CHECKLIST.md)** - Step-by-step integration checklist
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick reference for common tasks
- **[server/README.md](server/README.md)** - Backend API documentation

## Development Workflow

### Running Both Servers

**Option 1: Split Terminal**
1. Split your terminal (Ctrl+Shift+5 in VS Code)
2. Left: `cd server && npm run dev`
3. Right: `npm run dev`

**Option 2: Separate Terminals**
1. Terminal 1: Backend server
2. Terminal 2: Frontend dev server

### Making Changes

The development setup includes hot reload:
- **Backend**: Automatically restarts on file changes
- **Frontend**: Hot module replacement for instant updates

### Testing

```bash
# Test backend health
curl http://localhost:3001/api/health

# Check database
cd server
sqlite3 echo.db
sqlite> SELECT * FROM users;
```

## API Overview

### Authentication
```typescript
POST /api/auth/signup    - Register new user
POST /api/auth/login     - Login user
POST /api/auth/logout    - Logout user
```

### Blog Posts
```typescript
GET    /api/blog         - Get all posts
POST   /api/blog         - Create post
GET    /api/blog/:id     - Get single post
PUT    /api/blog/:id     - Update post
DELETE /api/blog/:id     - Delete post
```

### Notes
```typescript
GET    /api/notes                - Get all notes
POST   /api/notes                - Create note
GET    /api/notes/:id            - Get single note
PUT    /api/notes/:id            - Update note
DELETE /api/notes/:id            - Delete note
POST   /api/notes/:id/share      - Share note
POST   /api/notes/:id/comments   - Add comment
```

### Messages
```typescript
GET  /api/messages/conversations           - Get conversations
GET  /api/messages/conversations/:id       - Get messages
POST /api/messages/conversations/:id/messages - Send message
POST /api/messages/conversations           - Create conversation
GET  /api/messages/users                   - Get all users
```

### WebSocket
```
ws://localhost:3001/ws

Events:
- auth           - Authenticate connection
- message        - Send message
- new_message    - Receive message
- typing         - Typing indicator
- user_status    - Online/offline status
```

## Features Roadmap

### Current Features ✅
- User authentication
- Blog post management
- Note creation and editing
- Note sharing and comments
- Real-time messaging
- Online status tracking
- Typing indicators
- Read receipts

### Planned Features 🚧
- [ ] Image upload support
- [ ] Note version history
- [ ] Search functionality
- [ ] Email notifications
- [ ] Profile customization
- [ ] Note templates
- [ ] Export notes (PDF, Markdown)
- [ ] Group chat support
- [ ] Voice messages
- [ ] File attachments

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deployment

### Frontend Deployment
Deploy to Vercel, Netlify, or similar:
```bash
npm run build
# Deploy the 'dist' folder
```

### Backend Deployment
Deploy to Railway, Render, or Heroku:
1. Update environment variables
2. Upgrade to PostgreSQL
3. Enable HTTPS/WSS
4. Set secure JWT_SECRET

See [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md) for detailed deployment instructions.

## Environment Variables

### Frontend (.env in root)
```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001/ws
```

### Backend (server/.env)
```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

## Troubleshooting

### Backend won't start
- Check if port 3001 is in use: `lsof -ti :3001`
- Change port in `server/.env`

### Database errors
- Reset database: `cd server && rm echo.db && npm run dev`

### CORS errors
- Verify backend is running
- Check API URL in frontend matches backend port

### WebSocket connection fails
- Ensure backend is running
- Check WebSocket URL configuration
- Verify JWT token is valid

See [GETTING_STARTED.md](GETTING_STARTED.md) for more troubleshooting tips.

## Security

### Development
- Default JWT secret (change for production)
- SQLite database (file-based)
- CORS enabled for all origins

### Production Checklist
- [ ] Strong JWT_SECRET
- [ ] HTTPS/WSS enabled
- [ ] CORS restricted to frontend domain
- [ ] Rate limiting enabled
- [ ] Input validation
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] Error logging
- [ ] Database backups

## Performance

- Backend: Express with efficient routing
- Database: Indexed queries for fast lookups
- WebSocket: Event-based real-time updates
- Frontend: React with optimized rendering
- Bundle: Code splitting and lazy loading

## License

MIT License - see LICENSE file for details

## Support

- 📖 Documentation: See docs folder
- 🐛 Bug Reports: Open an issue
- 💡 Feature Requests: Open an issue
- 💬 Questions: Discussions tab

## Acknowledgments

- Built with React and Node.js
- Styled with TailwindCSS
- Icons by Lucide
- Real-time powered by WebSocket

---

**Echo** - Your all-in-one platform for blogging, notes, and messaging.

