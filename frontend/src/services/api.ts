import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL; // Adjust to your backend URL

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Auth Service
export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/login/', { username, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('username', username);
    }
    return response.data;
  },

  signup: async (username: string, password: string) => {
    const response = await api.post('/signup/', { username, password });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
  },
};

// Post Service
export const postService = {
  getPosts: async () => {
    const response = await api.get('/posts/');
    return response.data;
  },

  createPost: async (content: string) => {
    const response = await api.post('/posts/', { content });
    return response.data;
  },

  likePost: async (postId: number) => {
    const response = await api.post('/like/', {
      id: postId,
      type: 'post',
    });
    return response.data;
  },

  getComments: async (postId: number) => {
    const response = await api.get(`/posts/${postId}/comments/`);
    return response.data;
  },

  addComment: async (postId: number, content: string, parentId?: number) => {
    const response = await api.post(`/posts/${postId}/add_comment/`, {
      content,
      parent_id: parentId,
    });
    return response.data;
  },

  likeComment: async (commentId: number) => {
    const response = await api.post('/like/', {
      id: commentId,
      type: 'comment',
    });
    return response.data;
  },
};

// Comment Service (for backward compatibility)
export const commentService = {
  likeComment: async (commentId: number) => {
    return postService.likeComment(commentId);
  },
};

// Leaderboard Service
export const leaderboardService = {
  getLeaderboard: async () => {
    const response = await api.get('/leaderboard/');
    return response.data;
  },
};

export default api;