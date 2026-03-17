# Example: Migrating from localStorage to Backend API

This guide shows you how to update your React components to use the backend API instead of localStorage.

## Example 1: Blog Page Migration

### Before (localStorage version)

```typescript
// BlogPage.tsx - localStorage version
const [posts, setPosts] = useState<BlogPost[]>([]);

useEffect(() => {
  // Load from localStorage
  const savedPosts = localStorage.getItem('echo_blog_posts');
  if (savedPosts) {
    setPosts(JSON.parse(savedPosts));
  }
}, []);

const handleCreatePost = async (title: string, content: string) => {
  const newPost = {
    id: `post-${Date.now()}`,
    title,
    content,
    author: user?.name || 'Anonymous',
    createdAt: new Date().toISOString(),
  };

  const updated = [...posts, newPost];
  setPosts(updated);
  localStorage.setItem('echo_blog_posts', JSON.stringify(updated));
};

const handleDeletePost = async (id: string) => {
  const updated = posts.filter(p => p.id !== id);
  setPosts(updated);
  localStorage.setItem('echo_blog_posts', JSON.stringify(updated));
};
```

### After (Backend API version)

```typescript
// BlogPage.tsx - Backend API version
import { blogAPI } from '../services/api';

const [posts, setPosts] = useState<BlogPost[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  loadPosts();
}, []);

const loadPosts = async () => {
  try {
    setLoading(true);
    const data = await blogAPI.getAll();
    setPosts(data);
    setError(null);
  } catch (err: any) {
    setError(err.message || 'Failed to load posts');
  } finally {
    setLoading(false);
  }
};

const handleCreatePost = async (title: string, content: string) => {
  try {
    const newPost = await blogAPI.create(title, content);
    setPosts(prev => [newPost, ...prev]);
  } catch (err: any) {
    setError(err.message || 'Failed to create post');
  }
};

const handleDeletePost = async (id: string) => {
  try {
    await blogAPI.delete(id);
    setPosts(prev => prev.filter(p => p.id !== id));
  } catch (err: any) {
    setError(err.message || 'Failed to delete post');
  }
};
```

## Example 2: Notes Page with Real-time Comments

### Before (localStorage version)

```typescript
// NotesPage.tsx - localStorage version
const [notes, setNotes] = useState<Note[]>([]);

const handleAddComment = (noteId: string, comment: string) => {
  const updated = notes.map(note => {
    if (note.id === noteId) {
      return {
        ...note,
        comments: [...(note.comments || []), {
          id: `comment-${Date.now()}`,
          text: comment,
          author: user?.name || 'Anonymous',
          timestamp: new Date().toISOString(),
        }],
      };
    }
    return note;
  });

  setNotes(updated);
  localStorage.setItem('echo_notes', JSON.stringify(updated));
};
```

### After (Backend API version)

```typescript
// NotesPage.tsx - Backend API version
import { notesAPI } from '../services/api';

const [notes, setNotes] = useState<Note[]>([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  loadNotes();
}, []);

const loadNotes = async () => {
  try {
    setLoading(true);
    const data = await notesAPI.getAll();
    setNotes(data);
  } catch (err: any) {
    console.error('Failed to load notes:', err);
  } finally {
    setLoading(false);
  }
};

const handleAddComment = async (noteId: string, comment: string) => {
  try {
    const newComment = await notesAPI.addComment(noteId, comment);

    // Update local state optimistically
    setNotes(prev => prev.map(note => {
      if (note.id === noteId) {
        return {
          ...note,
          comments: [...(note.comments || []), newComment],
        };
      }
      return note;
    }));
  } catch (err: any) {
    console.error('Failed to add comment:', err);
  }
};

const handleShareNote = async (noteId: string, email: string) => {
  try {
    await notesAPI.share(noteId, email, 'view');
    // Refresh notes to get updated share info
    await loadNotes();
  } catch (err: any) {
    console.error('Failed to share note:', err);
  }
};
```

## Example 3: Chat/Messaging with WebSocket

### Before (localStorage version)

```typescript
// ChatPage.tsx - localStorage version
const [messages, setMessages] = useState<Message[]>([]);

useEffect(() => {
  const saved = localStorage.getItem('echo_messages');
  if (saved) {
    setMessages(JSON.parse(saved));
  }
}, []);

const sendMessage = (content: string) => {
  const newMessage = {
    id: `msg-${Date.now()}`,
    content,
    senderId: user?.id,
    timestamp: new Date().toISOString(),
  };

  const updated = [...messages, newMessage];
  setMessages(updated);
  localStorage.setItem('echo_messages', JSON.stringify(updated));
};
```

### After (Backend with WebSocket)

```typescript
// ChatPage.tsx - Backend with WebSocket
import { messagesAPI, wsClient } from '../services/api';
import { useEffect, useState } from 'react';

const [messages, setMessages] = useState<Message[]>([]);
const [conversations, setConversations] = useState<any[]>([]);
const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

useEffect(() => {
  // Load conversations
  loadConversations();

  // Connect WebSocket
  const user = localStorage.getItem('echo_user');
  if (user) {
    const userData = JSON.parse(user);
    wsClient.connect(userData.accessToken);

    // Listen for new messages
    wsClient.on('new_message', handleNewMessage);
    wsClient.on('user_status', handleUserStatus);
    wsClient.on('typing', handleTyping);

    return () => {
      wsClient.off('new_message', handleNewMessage);
      wsClient.off('user_status', handleUserStatus);
      wsClient.off('typing', handleTyping);
    };
  }
}, []);

useEffect(() => {
  if (selectedConversation) {
    loadMessages(selectedConversation);
  }
}, [selectedConversation]);

const loadConversations = async () => {
  try {
    const data = await messagesAPI.getConversations();
    setConversations(data);
  } catch (err) {
    console.error('Failed to load conversations:', err);
  }
};

const loadMessages = async (conversationId: string) => {
  try {
    const data = await messagesAPI.getMessages(conversationId);
    setMessages(data);

    // Mark messages as read
    await messagesAPI.markAsRead(conversationId);
  } catch (err) {
    console.error('Failed to load messages:', err);
  }
};

const handleNewMessage = (data: any) => {
  if (data.conversationId === selectedConversation) {
    setMessages(prev => [...prev, data.message]);
  }

  // Update conversation list with new message
  loadConversations();
};

const handleUserStatus = (data: any) => {
  setConversations(prev => prev.map(conv => {
    if (conv.other_user_id === data.userId) {
      return { ...conv, other_user_online: data.isOnline };
    }
    return conv;
  }));
};

const handleTyping = (data: any) => {
  if (data.conversationId === selectedConversation) {
    setTypingUsers(prev => {
      const updated = new Set(prev);
      if (data.isTyping) {
        updated.add(data.userId);
      } else {
        updated.delete(data.userId);
      }
      return updated;
    });
  }
};

const sendMessage = async (content: string) => {
  if (!selectedConversation) return;

  try {
    const message = await messagesAPI.sendMessage(selectedConversation, content);

    // Optimistic update
    setMessages(prev => [...prev, message]);

    // Send via WebSocket for real-time delivery
    wsClient.sendMessage(selectedConversation, content, message);

    // Update conversations list
    loadConversations();
  } catch (err) {
    console.error('Failed to send message:', err);
  }
};

const handleTyping = (isTyping: boolean) => {
  if (selectedConversation) {
    wsClient.sendTyping(selectedConversation, isTyping);
  }
};

return (
  <div className="chat-container">
    {/* Conversations list */}
    <div className="conversations">
      {conversations.map(conv => (
        <div
          key={conv.id}
          onClick={() => setSelectedConversation(conv.id)}
          className={selectedConversation === conv.id ? 'active' : ''}
        >
          <div className="conversation-info">
            <span className={conv.other_user_online ? 'online' : 'offline'}>
              {conv.other_user_name}
            </span>
            {conv.unread_count > 0 && (
              <span className="unread-badge">{conv.unread_count}</span>
            )}
          </div>
          <p className="last-message">{conv.last_message}</p>
        </div>
      ))}
    </div>

    {/* Messages */}
    <div className="messages">
      {messages.map(msg => (
        <div key={msg.id} className="message">
          <span>{msg.sender_name}: </span>
          <span>{msg.content}</span>
        </div>
      ))}

      {typingUsers.size > 0 && (
        <div className="typing-indicator">Someone is typing...</div>
      )}
    </div>

    {/* Input */}
    <input
      type="text"
      onFocus={() => handleTyping(true)}
      onBlur={() => handleTyping(false)}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          sendMessage(e.currentTarget.value);
          e.currentTarget.value = '';
        }
      }}
    />
  </div>
);
```

## Example 4: Updated AuthContext

```typescript
// src/app/context/AuthContext.tsx - Backend version
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI, wsClient } from "../services/api";

interface User {
  id: string;
  email: string;
  name: string;
  accessToken?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("echo_user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);

        // Reconnect WebSocket
        if (userData.accessToken) {
          wsClient.connect(userData.accessToken);
        }
      } catch (error) {
        console.error("Error loading saved user:", error);
        localStorage.removeItem("echo_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user: userData, token } = await authAPI.login(email, password);

      const userWithToken: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        accessToken: token,
      };

      setUser(userWithToken);
      setIsAuthenticated(true);
      localStorage.setItem("echo_user", JSON.stringify(userWithToken));

      // Connect WebSocket
      wsClient.connect(token);

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    try {
      const { user: userData, token } = await authAPI.signup(email, password, name);

      const userWithToken: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        accessToken: token,
      };

      setUser(userWithToken);
      setIsAuthenticated(true);
      localStorage.setItem("echo_user", JSON.stringify(userWithToken));

      // Connect WebSocket
      wsClient.connect(token);

      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      wsClient.disconnect();

      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("echo_user");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

## Key Changes Summary

1. **Import API functions** from `services/api.ts`
2. **Add loading states** for async operations
3. **Add error handling** with try/catch
4. **Use async/await** for all API calls
5. **Optimistic updates** for better UX
6. **WebSocket integration** for real-time features
7. **Store JWT tokens** in user object
8. **Remove direct localStorage** manipulation (except for user session)

## Testing Your Changes

1. Start both servers (backend and frontend)
2. Open browser DevTools
3. Check Network tab for API calls
4. Check Console for errors
5. Test each feature:
   - Sign up / Login
   - Create, read, update, delete operations
   - Real-time messaging
   - Online status indicators

## Common Pitfalls

1. **Forgetting to handle loading states** - Users see stale data
2. **Not handling errors** - App crashes on network failure
3. **Missing await** - Promises not resolved
4. **Not updating JWT token** - Auth fails after token expires
5. **WebSocket not reconnecting** - Real-time features stop working
