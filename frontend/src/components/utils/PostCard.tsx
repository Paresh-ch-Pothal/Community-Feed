import React, { useState } from 'react';
import { Heart, MessageCircle, Send } from 'lucide-react';
import Avatar from './Avatar';
import UserComment from './UserComment';
import type { Comment, Post } from '../../types';
import { formatTimeAgo } from '../../utils/helpers';


interface PostCardProps {
  post: Post;
  onLike: (id: number) => void;
  onExpand: (id: number) => void;
  isExpanded: boolean;
  comments: Comment[];
  onAddComment: (postId: number, content: string, parentId?: number) => void;
  onLikeComment: (commentId: number, postId: number) => void;
  currentUsername: string;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onExpand,
  isExpanded,
  comments,
  onAddComment,
  onLikeComment,
  currentUsername,
}) => {
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!commentContent.trim()) return;
    setIsSubmitting(true);
    await onAddComment(post.id, commentContent);
    setCommentContent('');
    setIsSubmitting(false);
  };

  const handleCommentReply = async (parentId: number, content: string) => {
    await onAddComment(post.id, content, parentId);
  };

  return (
    <article className="bg-white rounded-lg overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
      {/* Post Header */}
      <div className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <Avatar username={post.author} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-900">
                {post.author}
              </h3>
              <span className="text-sm text-slate-500">
                {formatTimeAgo(post.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <p className="text-slate-700 text-base leading-relaxed mb-4">
          {post.content}
        </p>

        {/* Post Actions */}
        <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-2 transition-colors ${
              post.is_liked
                ? 'text-blue-600'
                : 'text-slate-500 hover:text-blue-600'
            }`}
          >
            <Heart
              className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`}
            />
            <span className="text-sm font-medium">{post.like_count || 0}</span>
          </button>
          <button
            onClick={() => onExpand(post.id)}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{post.comments_count || 0}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {isExpanded && (
        <div className="bg-slate-50 border-t border-slate-200">
          {/* Add Comment */}
          <div className="p-4 bg-white border-b border-slate-200">
            <div className="flex gap-3">
              <Avatar username={currentUsername} size="sm" />
              <div className="flex-1">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none text-sm text-slate-700"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSubmitComment}
                    disabled={isSubmitting || !commentContent.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="p-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">
                Comments ({comments.length})
              </h4>
              <div className="space-y-1">
                {comments.map((comment) => (
                  <UserComment
                    key={comment.id}
                    comment={comment}
                    postId={post.id}
                    depth={0}
                    onLike={onLikeComment}
                    onReply={handleCommentReply}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">No comments yet</p>
              <p className="text-xs text-slate-400 mt-1">Be the first to comment!</p>
            </div>
          )}
        </div>
      )}
    </article>
  );
};

export default PostCard;