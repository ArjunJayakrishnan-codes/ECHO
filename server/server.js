import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import db, { initDatabase } from './database.js';
import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blog.js';
import notesRoutes from './routes/notes.js';
import messagesRoutes from './routes/messages.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://hwvkodrvjrpfhkihezoy.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabase = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

// Log Supabase initialization status
if (supabase) {
  console.log('✓ Supabase initialized with Service Role Key');
} else {
  console.warn('⚠ Supabase Service Role Key not found - falling back to local auth');
}

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/messages', messagesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Echo backend is running' });
});

// Create HTTP server
const server = createServer(app);

// WebSocket server for real-time messaging
const wss = new WebSocketServer({ server, path: '/ws' });

// Store connected clients
const clients = new Map();

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');

  let userId = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      // Handle authentication
      if (data.type === 'auth') {
        try {
          const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
          userId = decoded.id;
          clients.set(userId, ws);

          // Update user status to online
          db.prepare('UPDATE user_status SET is_online = 1, last_seen = CURRENT_TIMESTAMP WHERE user_id = ?')
            .run(userId);

          ws.send(JSON.stringify({ type: 'auth', success: true }));

          // Broadcast user online status
          broadcastUserStatus(userId, true);
        } catch (error) {
          ws.send(JSON.stringify({ type: 'auth', success: false, error: 'Invalid token' }));
        }
      }

      // Handle new message
      if (data.type === 'message' && userId) {
        const { conversationId, content } = data;

        // Get conversation participants
        const conversation = db.prepare('SELECT * FROM conversations WHERE id = ?')
          .get(conversationId);

        if (conversation) {
          const recipientId = conversation.participant1_id === userId
            ? conversation.participant2_id
            : conversation.participant1_id;

          // Send message to recipient if online
          const recipientWs = clients.get(recipientId);
          if (recipientWs && recipientWs.readyState === ws.OPEN) {
            recipientWs.send(JSON.stringify({
              type: 'new_message',
              conversationId,
              message: data.message
            }));
          }
        }
      }

      // Handle typing indicator
      if (data.type === 'typing' && userId) {
        const { conversationId, isTyping } = data;

        const conversation = db.prepare('SELECT * FROM conversations WHERE id = ?')
          .get(conversationId);

        if (conversation) {
          const recipientId = conversation.participant1_id === userId
            ? conversation.participant2_id
            : conversation.participant1_id;

          const recipientWs = clients.get(recipientId);
          if (recipientWs && recipientWs.readyState === ws.OPEN) {
            recipientWs.send(JSON.stringify({
              type: 'typing',
              conversationId,
              userId,
              isTyping
            }));
          }
        }
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    if (userId) {
      clients.delete(userId);

      // Update user status to offline
      db.prepare('UPDATE user_status SET is_online = 0, last_seen = CURRENT_TIMESTAMP WHERE user_id = ?')
        .run(userId);

      // Broadcast user offline status
      broadcastUserStatus(userId, false);
    }
    console.log('WebSocket connection closed');
  });
});

// Broadcast user online/offline status
function broadcastUserStatus(userId, isOnline) {
  const message = JSON.stringify({
    type: 'user_status',
    userId,
    isOnline
  });

  clients.forEach((client, clientId) => {
    if (clientId !== userId && client.readyState === 1) {
      client.send(message);
    }
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`Echo backend server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}/ws`);
});
