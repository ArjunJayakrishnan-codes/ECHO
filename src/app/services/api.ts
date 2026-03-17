// API service for Echo backend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws';

// Helper function to get auth token
function getAuthToken(): string | null {
  const user = localStorage.getItem('echo_user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.accessToken;
    } catch {
      return null;
    }
  }
  return null;
}

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Auth API
export const authAPI = {
  signup: async (email: string, password: string, name: string) => {
    return apiRequest<{ user: any; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  login: async (email: string, password: string) => {
    return apiRequest<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async () => {
    return apiRequest<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  },
};

// Blog API
export const blogAPI = {
  getAll: async () => {
    return apiRequest<any[]>('/blog');
  },

  getById: async (id: string) => {
    return apiRequest<any>(`/blog/${id}`);
  },

  create: async (title: string, content: string) => {
    return apiRequest<any>('/blog', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
  },

  update: async (id: string, title: string, content: string) => {
    return apiRequest<any>(`/blog/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, content }),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/blog/${id}`, {
      method: 'DELETE',
    });
  },
};

// Notes API
export const notesAPI = {
  getAll: async () => {
    return apiRequest<any[]>('/notes');
  },

  getById: async (id: string) => {
    return apiRequest<any>(`/notes/${id}`);
  },

  create: async (title: string, content: string, folder?: string) => {
    return apiRequest<any>('/notes', {
      method: 'POST',
      body: JSON.stringify({ title, content, folder }),
    });
  },

  update: async (id: string, title: string, content: string, folder?: string) => {
    return apiRequest<any>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, content, folder }),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/notes/${id}`, {
      method: 'DELETE',
    });
  },

  share: async (id: string, email: string, permission: 'view' | 'edit' = 'view') => {
    return apiRequest<{ message: string }>(`/notes/${id}/share`, {
      method: 'POST',
      body: JSON.stringify({ email, permission }),
    });
  },

  addComment: async (id: string, content: string) => {
    return apiRequest<any>(`/notes/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },
};

// Messages API
export const messagesAPI = {
  getConversations: async () => {
    return apiRequest<any[]>('/messages/conversations');
  },

  getMessages: async (conversationId: string) => {
    return apiRequest<any[]>(`/messages/conversations/${conversationId}`);
  },

  sendMessage: async (conversationId: string, content: string) => {
    return apiRequest<any>(`/messages/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  createConversation: async (otherUserEmail: string) => {
    return apiRequest<any>('/messages/conversations', {
      method: 'POST',
      body: JSON.stringify({ otherUserEmail }),
    });
  },

  getUsers: async () => {
    return apiRequest<any[]>('/messages/users');
  },

  markAsRead: async (conversationId: string) => {
    return apiRequest<{ message: string }>(`/messages/conversations/${conversationId}/read`, {
      method: 'PUT',
    });
  },
};

// WebSocket client for real-time messaging
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(token: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      // Authenticate
      this.send({ type: 'auth', token });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      this.reconnectTimeout = setTimeout(() => {
        const token = getAuthToken();
        if (token) {
          this.connect(token);
        }
      }, 5000);
    };
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => callback(data));
    }
  }

  // Messaging methods
  sendMessage(conversationId: string, content: string, message: any) {
    this.send({
      type: 'message',
      conversationId,
      content,
      message,
    });
  }

  sendTyping(conversationId: string, isTyping: boolean) {
    this.send({
      type: 'typing',
      conversationId,
      isTyping,
    });
  }
}

// Export singleton WebSocket client
export const wsClient = new WebSocketClient();

// Health check
export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
};
