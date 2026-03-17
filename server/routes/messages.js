import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all conversations for user
router.get('/conversations', authenticateToken, (req, res) => {
  try {
    const conversations = db.prepare(`
      SELECT
        c.id,
        c.created_at,
        CASE
          WHEN c.participant1_id = ? THEN u2.id
          ELSE u1.id
        END as other_user_id,
        CASE
          WHEN c.participant1_id = ? THEN u2.name
          ELSE u1.name
        END as other_user_name,
        CASE
          WHEN c.participant1_id = ? THEN u2.email
          ELSE u1.email
        END as other_user_email,
        CASE
          WHEN c.participant1_id = ? THEN us2.is_online
          ELSE us1.is_online
        END as other_user_online,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = 0) as unread_count
      FROM conversations c
      JOIN users u1 ON c.participant1_id = u1.id
      JOIN users u2 ON c.participant2_id = u2.id
      LEFT JOIN user_status us1 ON u1.id = us1.user_id
      LEFT JOIN user_status us2 ON u2.id = us2.user_id
      WHERE c.participant1_id = ? OR c.participant2_id = ?
      ORDER BY last_message_time DESC
    `).all(req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id);

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId', authenticateToken, (req, res) => {
  try {
    const messages = db.prepare(`
      SELECT m.*, u.name as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `).all(req.params.conversationId);

    // Mark messages as read
    db.prepare(`
      UPDATE messages
      SET is_read = 1
      WHERE conversation_id = ? AND sender_id != ?
    `).run(req.params.conversationId, req.user.id);

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send message
router.post('/conversations/:conversationId/messages', authenticateToken, (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  try {
    const conversation = db.prepare(`
      SELECT * FROM conversations
      WHERE id = ? AND (participant1_id = ? OR participant2_id = ?)
    `).get(req.params.conversationId, req.user.id, req.user.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    db.prepare(`
      INSERT INTO messages (id, conversation_id, sender_id, content)
      VALUES (?, ?, ?, ?)
    `).run(messageId, req.params.conversationId, req.user.id, content);

    const message = db.prepare(`
      SELECT m.*, u.name as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `).get(messageId);

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create or get conversation
router.post('/conversations', authenticateToken, (req, res) => {
  const { otherUserEmail } = req.body;

  if (!otherUserEmail) {
    return res.status(400).json({ error: 'Other user email is required' });
  }

  try {
    const otherUser = db.prepare('SELECT * FROM users WHERE email = ?').get(otherUserEmail);

    if (!otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (otherUser.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot create conversation with yourself' });
    }

    // Check if conversation already exists
    let conversation = db.prepare(`
      SELECT * FROM conversations
      WHERE (participant1_id = ? AND participant2_id = ?)
         OR (participant1_id = ? AND participant2_id = ?)
    `).get(req.user.id, otherUser.id, otherUser.id, req.user.id);

    if (!conversation) {
      // Create new conversation
      const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      db.prepare(`
        INSERT INTO conversations (id, participant1_id, participant2_id)
        VALUES (?, ?, ?)
      `).run(conversationId, req.user.id, otherUser.id);

      conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(conversationId);
    }

    res.json({
      ...conversation,
      other_user: {
        id: otherUser.id,
        name: otherUser.name,
        email: otherUser.email
      }
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users (for contact list)
router.get('/users', authenticateToken, (req, res) => {
  try {
    const users = db.prepare(`
      SELECT u.id, u.name, u.email, us.is_online, us.last_seen
      FROM users u
      LEFT JOIN user_status us ON u.id = us.user_id
      WHERE u.id != ?
      ORDER BY u.name ASC
    `).all(req.user.id);

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark messages as read
router.put('/conversations/:conversationId/read', authenticateToken, (req, res) => {
  try {
    db.prepare(`
      UPDATE messages
      SET is_read = 1
      WHERE conversation_id = ? AND sender_id != ?
    `).run(req.params.conversationId, req.user.id);

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
