import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import type { Comment, LeaderboardEntry, Post } from '../../types';
import { authService, leaderboardService, postService } from '../../services/api';
import { countAllComments } from '../../utils/helpers';
import Leaderboard from '../utils/LeaderBoard';
import Header from '../utils/Header';
import PostCard from '../utils/PostCard';
import CreatePostModal from '../utils/CreatePostModal';


const Feed: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const savedUsername = localStorage.getItem('username');
    
    if (!token || !savedUsername) {
      navigate('/login');
      return;
    }

    setUsername(savedUsername);
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [postsRes, leaderboardRes] = await Promise.all([
        postService.getPosts(),
        leaderboardService.getLeaderboard(),
      ]);
      
      setPosts(postsRes);
      setLeaderboard(leaderboardRes);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleLikePost = async (postId: number) => {
    try {
      const response = await postService.likePost(postId);
      
      // Update post with server response
      setPosts(prevPosts =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                is_liked: response.status === 'liked',
                like_count: response.like_count,
              }
            : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleExpandPost = async (postId: number) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      return;
    }

    setExpandedPostId(postId);

    if (!comments[postId]) {
      try {
        const response = await postService.getComments(postId);
        setComments(prev => ({ ...prev, [postId]: response }));
        
        // Update comment count
        setPosts(prevPosts => prevPosts.map(post => 
          post.id === postId 
            ? { ...post, comments_count: countAllComments(response) }
            : post
        ));
      } catch (error) {
        console.error('Error loading comments:', error);
      }
    }
  };

  const handleAddComment = async (
    postId: number,
    content: string,
    parentId?: number
  ) => {
    try {
      await postService.addComment(postId, content, parentId);

      // Refresh comments for this post
      const commentsRes = await postService.getComments(postId);
      setComments(prev => ({ ...prev, [postId]: commentsRes }));

      // Update comment count
      setPosts(prevPosts =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments_count: countAllComments(commentsRes) }
            : post
        )
      );
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLikeComment = async (commentId: number, postId: number) => {
    try {
      const response = await postService.likeComment(commentId);
      
      // Update the comment in state
      setComments(prev => {
        const postComments = prev[postId];
        if (!postComments) return prev;
        
        const updatedComments = updateCommentLikeStatus(
          postComments,
          commentId,
          response.status === 'liked',
          response.like_count
        );
        
        return { ...prev, [postId]: updatedComments };
      });
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  // Helper function to recursively update comment like status
  const updateCommentLikeStatus = (
    commentList: Comment[],
    commentId: number,
    isLiked: boolean,
    likeCount: number
  ): Comment[] => {
    return commentList.map((comment) => {
      if (comment.id === commentId) {
        return { ...comment, is_liked: isLiked, likes: likeCount };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentLikeStatus(comment.replies, commentId, isLiked, likeCount),
        };
      }
      return comment;
    });
  };

  const handleCreatePost = async () => {
    try {
      const response = await postService.getPosts();
      setPosts(response);
    } catch (error) {
      console.error('Error reloading posts:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        username={username} 
        onLogout={handleLogout}
        onCreatePost={() => setShowCreatePostModal(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feed */}
          <div className="lg:col-span-2 space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-600 font-medium">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                  <Plus className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No posts yet</h3>
                <p className="text-slate-600 mb-6">Be the first to share something amazing!</p>
                <button
                  onClick={() => setShowCreatePostModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Post
                </button>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLikePost}
                  onExpand={handleExpandPost}
                  isExpanded={expandedPostId === post.id}
                  comments={comments[post.id] || []}
                  onAddComment={handleAddComment}
                  onLikeComment={handleLikeComment}
                  currentUsername={username}
                />
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Leaderboard entries={leaderboard} />
          </div>
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => setShowCreatePostModal(true)}
          className="fixed bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center group z-50"
          aria-label="Create post"
        >
          <Plus className="w-7 h-7 md:w-8 md:h-8" />
          <span className="absolute right-20 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block">
            Create Post
          </span>
        </button>

        {/* Create Post Modal */}
        {showCreatePostModal && (
          <CreatePostModal
            onClose={() => setShowCreatePostModal(false)}
            onSuccess={handleCreatePost}
          />
        )}
      </main>
    </div>
  );
};

export default Feed;