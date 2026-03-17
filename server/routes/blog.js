import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all blog posts
router.get('/', authenticateToken, (req, res) => {
  try {
    const posts = db.prepare(`
      SELECT id, user_id, title, content, author, created_at, updated_at
      FROM blog_posts
      ORDER BY created_at DESC
    `).all();

    res.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single blog post
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const post = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create blog post
router.post('/', authenticateToken, (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const postId = `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const user = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user.id);

    db.prepare(`
      INSERT INTO blog_posts (id, user_id, title, content, author)
      VALUES (?, ?, ?, ?, ?)
    `).run(postId, req.user.id, title, content, user.name);

    const post = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(postId);

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update blog post
router.put('/:id', authenticateToken, (req, res) => {
  const { title, content } = req.body;

  try {
    const post = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this post' });
    }

    db.prepare(`
      UPDATE blog_posts
      SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, content, req.params.id);

    const updatedPost = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);

    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete blog post
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const post = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    db.prepare('DELETE FROM blog_posts WHERE id = ?').run(req.params.id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
