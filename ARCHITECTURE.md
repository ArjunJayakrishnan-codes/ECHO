# Echo Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Echo Application                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│      Frontend (React)     │         │   Backend (Node.js)      │
│      Port: 5173          │         │     Port: 3001           │
├──────────────────────────┤         ├──────────────────────────┤
│                          │         │                          │
│  ┌────────────────────┐  │         │  ┌────────────────────┐  │
│  │  React Components  │  │         │  │   Express Server   │  │
│  │  - BlogPage       │  │         │  │   - Routes         │  │
│  │  - NotesPage      │  │◄───────►│  │   - Middleware     │  │
│  │  - ChatPage       │  │  HTTP   │  │   - Controllers    │  │
│  │  - Dashboard      │  │  REST   │  │                    │  │
│  └────────────────────┘  │         │  └────────────────────┘  │
│           │              │         │           │              │
│           ▼              │         │           ▼              │
│  ┌────────────────────┐  │         │  ┌────────────────────┐  │
│  │   Context/State    │  │         │  │   SQLite Database  │  │
│  │  - AuthContext    │  │         │  │   - users          │  │
│  │  - ThemeContext   │  │         │  │   - blog_posts     │  │
│  └────────────────────┘  │         │  │   - notes          │  │
│           │              │         │  │   - messages       │  │
│           ▼              │         │  │   - conversations  │  │
│  ┌────────────────────┐  │         │  └────────────────────┘  │
│  │   API Service      │  │         │                          │
│  │  - authAPI        │  │         │  ┌────────────────────┐  │
│  │  - blogAPI        │  │◄───────►│  │  WebSocket Server  │  │
│  │  - notesAPI       │  │  WS     │  │  - Real-time msgs  │  │
│  │  - messagesAPI    │  │         │  │  - User status     │  │
│  │  - wsClient       │  │         │  │  - Typing          │  │
│  └────────────────────┘  │         │  └────────────────────┘  │
│                          │         │                          │
└──────────────────────────┘         └──────────────────────────┘
```

## Component Communication Flow

### 1. Authentication Flow

```
┌─────────┐     ┌──────────────┐     ┌─────────┐     ┌──────────┐
│ User    │────►│ LoginPage    │────►│ authAPI │────►│ Backend  │
└─────────┘     └──────────────┘     └─────────┘     └──────────┘
                       │                                    │
                       │              ┌──────────┐          │
                       └─────────────►│ JWT Token│◄─────────┘
                                      └──────────┘
                                           │
                       ┌───────────────────┘
                       ▼
                ┌──────────────┐
                │ localStorage │
                └──────────────┘
                       │
                       ▼
                ┌──────────────┐
                │ AuthContext  │
                └──────────────┘
                       │
                       ▼
                ┌──────────────┐
                │ All Pages    │
                └──────────────┘
```

### 2. Blog Post Creation Flow

```
User Types in Editor
        │
        ▼
┌───────────────┐
│  BlogPage     │
└───────────────┘
        │
        │ handleCreatePost()
        ▼
┌───────────────┐
│  blogAPI      │
└───────────────┘
        │
        │ POST /api/blog
        │ Headers: { Authorization: Bearer <token> }
        │ Body: { title, content }
        ▼
┌───────────────────────────┐
│  Backend: auth.js         │
│  - Verify JWT token       │
│  - Extract user ID        │
└───────────────────────────┘
        │
        ▼
┌───────────────────────────┐
│  Backend: blog.js         │
│  - Create post in DB      │
│  - Return new post        │
└───────────────────────────┘
        │
        ▼
┌───────────────────────────┐
│  Frontend: BlogPage       │
│  - Update local state     │
│  - Show new post          │
└───────────────────────────┘
```

### 3. Real-time Messaging Flow

```
User A                          Backend                    User B
  │                                │                          │
  │ 1. Connect WebSocket           │                          │
  ├───────────────────────────────►│                          │
  │                                │                          │
  │ 2. Authenticate with JWT       │                          │
  ├───────────────────────────────►│                          │
  │                                │                          │
  │ 3. Set status: online          │                          │
  │                                ├─────────────────────────►│
  │                                │  Broadcast online status │
  │                                │                          │
  │ 4. Send message                │                          │
  ├───────────────────────────────►│                          │
  │                                │                          │
  │                                │ 5. Save to database      │
  │                                │                          │
  │                                │ 6. Send to recipient     │
  │                                ├─────────────────────────►│
  │                                │                          │
  │                                │ 7. User B receives msg   │
  │                                │                          │
  │ 8. User B typing...            │                          │
  │                                │◄─────────────────────────┤
  │                                │                          │
  │◄───────────────────────────────┤                          │
  │  Typing indicator              │                          │
  │                                │                          │
```

## Database Schema

```sql
┌──────────────────┐
│     users        │
├──────────────────┤
│ id (PK)          │───┐
│ email (UNIQUE)   │   │
│ password         │   │
│ name             │   │
│ created_at       │   │
└──────────────────┘   │
                       │
    ┌──────────────────┼──────────────────┐
    │                  │                  │
    ▼                  ▼                  ▼
┌─────────────┐  ┌─────────────┐  ┌──────────────┐
│ blog_posts  │  │   notes     │  │   messages   │
├─────────────┤  ├─────────────┤  ├──────────────┤
│ id (PK)     │  │ id (PK)     │  │ id (PK)      │
│ user_id (FK)│  │ user_id (FK)│  │ sender_id(FK)│
│ title       │  │ title       │  │ content      │
│ content     │  │ content     │  │ conversation │
│ author      │  │ folder      │  │ is_read      │
│ created_at  │  │ created_at  │  │ created_at   │
│ updated_at  │  │ updated_at  │  └──────────────┘
└─────────────┘  └─────────────┘         │
                        │                │
                        │                │
                        ▼                │
                 ┌─────────────┐         │
                 │note_shares  │         │
                 ├─────────────┤         │
                 │ id (PK)     │         │
                 │ note_id (FK)│         │
                 │ shared_with │         │
                 │ permission  │         │
                 └─────────────┘         │
                        │                │
                        ▼                │
                 ┌─────────────┐         │
                 │note_comments│         │
                 ├─────────────┤         │
                 │ id (PK)     │         │
                 │ note_id (FK)│         │
                 │ user_id (FK)│         │
                 │ content     │         │
                 └─────────────┘         │
                                        │
                                        ▼
                              ┌──────────────────┐
                              │ conversations    │
                              ├──────────────────┤
                              │ id (PK)          │
                              │ participant1(FK) │
                              │ participant2(FK) │
                              │ created_at       │
                              └──────────────────┘
```

## API Endpoints Structure

```
/api
├── /auth
│   ├── POST   /signup      - Create new user
│   ├── POST   /login       - Authenticate user
│   └── POST   /logout      - End session
│
├── /blog
│   ├── GET    /            - Get all posts
│   ├── GET    /:id         - Get single post
│   ├── POST   /            - Create post
│   ├── PUT    /:id         - Update post
│   └── DELETE /:id         - Delete post
│
├── /notes
│   ├── GET    /            - Get all notes
│   ├── GET    /:id         - Get single note
│   ├── POST   /            - Create note
│   ├── PUT    /:id         - Update note
│   ├── DELETE /:id         - Delete note
│   ├── POST   /:id/share   - Share note
│   └── POST   /:id/comments - Add comment
│
└── /messages
    ├── GET    /conversations           - Get all conversations
    ├── GET    /conversations/:id       - Get messages
    ├── POST   /conversations           - Create conversation
    ├── POST   /conversations/:id/messages - Send message
    ├── PUT    /conversations/:id/read  - Mark as read
    └── GET    /users                   - Get all users
```

## WebSocket Event Flow

```
Client Events                    Server Events
─────────────────               ─────────────────

┌──────────────┐                ┌──────────────┐
│ auth         │───────────────►│ auth         │
│ - token      │                │ - success    │
└──────────────┘                └──────────────┘

┌──────────────┐                ┌──────────────┐
│ message      │───────────────►│ new_message  │
│ - convId     │                │ - message    │
│ - content    │                │ - convId     │
└──────────────┘                └──────────────┘

┌──────────────┐                ┌──────────────┐
│ typing       │───────────────►│ typing       │
│ - convId     │                │ - userId     │
│ - isTyping   │                │ - isTyping   │
└──────────────┘                └──────────────┘

                                ┌──────────────┐
                                │ user_status  │
                                │ - userId     │
                                │ - isOnline   │
                                └──────────────┘
```

## Request/Response Lifecycle

```
1. User Action
   │
   ├─► Click button / Submit form
   │
2. Component Handler
   │
   ├─► handleCreatePost() / handleSendMessage()
   │
3. API Service
   │
   ├─► blogAPI.create() / messagesAPI.sendMessage()
   │   ├─► Get JWT token from localStorage
   │   ├─► Add Authorization header
   │   └─► Make fetch() request
   │
4. Backend Middleware
   │
   ├─► authenticateToken()
   │   ├─► Verify JWT signature
   │   ├─► Check expiration
   │   └─► Extract user ID
   │
5. Backend Route Handler
   │
   ├─► Validate request data
   ├─► Execute database query
   ├─► Format response
   └─► Send JSON response
   │
6. Frontend API Service
   │
   ├─► Receive response
   ├─► Parse JSON
   └─► Return data to component
   │
7. Component Update
   │
   ├─► Update local state
   ├─► Re-render UI
   └─► Show success message
```

## State Management Flow

```
┌─────────────────────────────────────────────────────┐
│                   Application Root                   │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                   AuthProvider                       │
│  - user: User | null                                │
│  - isAuthenticated: boolean                         │
│  - login() / signup() / logout()                    │
└─────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   ┌─────────┐     ┌──────────┐    ┌──────────┐
   │BlogPage │     │NotesPage │    │ChatPage  │
   └─────────┘     └──────────┘    └──────────┘
        │                │               │
        ▼                ▼               ▼
   [Local State]   [Local State]   [Local State]
   - posts[]       - notes[]        - messages[]
   - loading       - selectedNote   - conversations[]
   - error         - folders[]      - selectedChat
```

## Technology Stack

```
Frontend                    Backend
────────────────           ────────────────
React 18.3                 Node.js
TypeScript                 Express.js
Vite                       Better SQLite3
TailwindCSS                JSON Web Token (JWT)
React Router               bcryptjs
React Quill                WebSocket (ws)
Lucide Icons               CORS
localStorage               dotenv

Development Tools          Database
────────────────           ────────────────
VS Code                    SQLite (dev)
npm/pnpm                   PostgreSQL (prod)
Chrome DevTools
Git
```

## Security Layers

```
┌──────────────────────────────────────────┐
│           Client Security                 │
│  - JWT stored in localStorage            │
│  - Token sent in Authorization header    │
│  - HTTPS (production)                    │
└──────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────┐
│        Transport Security                 │
│  - CORS enabled                          │
│  - WSS for WebSocket (production)        │
└──────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────┐
│       Backend Middleware                  │
│  - JWT verification                      │
│  - Token expiration check                │
│  - User authentication                   │
└──────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────┐
│          Database Layer                   │
│  - Password hashing (bcrypt)             │
│  - Foreign key constraints               │
│  - Data validation                       │
└──────────────────────────────────────────┘
```

## Deployment Architecture (Production)

```
┌─────────────────────────────────────────────────────┐
│                    Internet                          │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                  CDN / Static Host                   │
│              (Vercel, Netlify, etc.)                │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         React Build (Static Files)          │    │
│  │         - index.html                        │    │
│  │         - bundle.js                         │    │
│  │         - styles.css                        │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                         │
                         │ API Calls
                         ▼
┌─────────────────────────────────────────────────────┐
│               Backend Server Host                    │
│         (Railway, Render, Heroku, etc.)             │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         Node.js/Express Server              │    │
│  │         - REST API                          │    │
│  │         - WebSocket Server                  │    │
│  └────────────────────────────────────────────┘    │
│                         │                            │
│                         ▼                            │
│  ┌────────────────────────────────────────────┐    │
│  │         PostgreSQL Database                 │    │
│  │         (Managed Database Service)          │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

This architecture provides a clean separation between frontend and backend, enabling:
- Independent scaling
- Easy deployment
- Clear API contracts
- Real-time features
- Secure authentication
- Efficient data management
