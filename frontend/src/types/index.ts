
export interface Post {
  id: number;
  author: string;
  content: string;
  created_at: string;
  is_liked: boolean;
  like_count: number;
  comments_count: number;
}

export interface Comment {
  id: number;
  author: string;
  content: string;
  created_at: string;
  likes: number;
  is_liked: boolean;
  replies: Comment[];
}

export interface LeaderboardEntry {
  username: string;
  karma: number;
}

export interface User {
  id: number;
  username: string;
}