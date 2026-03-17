import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all notes for user
router.get('/', authenticateToken, (req, res) => {
  try {
    const notes = db.prepare(`
      SELECT n.*,
        GROUP_CONCAT(DISTINCT ns.shared_with_email) as shared_with
      FROM notes n
      LEFT JOIN note_shares ns ON n.id = ns.note_id
      WHERE n.user_id = ?
      GROUP BY n.id
      ORDER BY n.updated_at DESC
    `).all(req.user.id);

    // Parse shared_with from comma-separated string to array
    const notesWithShares = notes.map(note => ({
      ...note,
      shared_with: note.shared_with ? note.shared_with.split(',') : []
    }));

    res.json(notesWithShares);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single note
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const note = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Get shares
    const shares = db.prepare('SELECT * FROM note_shares WHERE note_id = ?')
      .all(req.params.id);

    // Get comments
    const comments = db.prepare(`
      SELECT * FROM note_comments
      WHERE note_id = ?
      ORDER BY created_at ASC
    `).all(req.params.id);

    res.json({ ...note, shares, comments });
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create note
router.post('/', authenticateToken, (req, res) => {
  const { title, content, folder } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const noteId = `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    db.prepare(`
      INSERT INTO notes (id, user_id, title, content, folder)
      VALUES (?, ?, ?, ?, ?)
    `).run(noteId, req.user.id, title, content, folder || 'General');

    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(noteId);

    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update note
router.put('/:id', authenticateToken, (req, res) => {
  const { title, content, folder } = req.body;

  try {
    const note = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    db.prepare(`
      UPDATE notes
      SET title = ?, content = ?, folder = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, content, folder || note.folder, req.params.id);

    const updatedNote = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);

    res.json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete note
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const note = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Share note
router.post('/:id/share', authenticateToken, (req, res) => {
  const { email, permission } = req.body;

  try {
    const note = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const shareId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    db.prepare(`
      INSERT INTO note_shares (id, note_id, shared_with_email, permission)
      VALUES (?, ?, ?, ?)
    `).run(shareId, req.params.id, email, permission || 'view');

    res.status(201).json({ message: 'Note shared successfully' });
  } catch (error) {
    console.error('Error sharing note:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add comment to note
router.post('/:id/comments', authenticateToken, (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Comment content is required' });
  }

  try {
    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const user = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user.id);
    const commentId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    db.prepare(`
      INSERT INTO note_comments (id, note_id, user_id, user_name, content)
      VALUES (?, ?, ?, ?, ?)
    `).run(commentId, req.params.id, req.user.id, user.name, content);

    const comment = db.prepare('SELECT * FROM note_comments WHERE id = ?').get(commentId);

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
