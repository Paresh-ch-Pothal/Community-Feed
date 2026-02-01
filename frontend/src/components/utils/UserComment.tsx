
import React, { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import Avatar from './Avatar';
import type { Comment } from '../../types';
import { formatTimeAgo } from '../../utils/helpers';

interface UserCommentProps {
  comment: Comment;
  postId: number;
  depth: number;
  onLike: (commentId: number, postId: number) => void;
  onReply: (parentId: number, content: string) => void;
}

const UserComment: React.FC<UserCommentProps> = ({
  comment,
  postId,
  depth,
  onLike,
  onReply,
}) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;
    setIsSubmitting(true);
    await onReply(comment.id, replyContent);
    setReplyContent('');
    setShowReplyBox(false);
    setIsSubmitting(false);
  };

  const maxDepth = 3;
  const canReply = depth < maxDepth;

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-3' : 'mb-4'}`}>
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        {/* Comment Header */}
        <div className="flex items-start gap-3">
          <Avatar username={comment.author} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-slate-900 text-sm">
                {comment.author}
              </span>
              <span className="text-xs text-slate-500">
                {formatTimeAgo(comment.created_at)}
              </span>
            </div>
            
            {/* Comment Content */}
            <p className="text-slate-700 text-sm mb-3">{comment.content}</p>

            {/* Comment Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => onLike(comment.id, postId)}
                className={`flex items-center gap-1.5 text-xs transition-colors ${
                  comment.is_liked
                    ? 'text-blue-600'
                    : 'text-slate-500 hover:text-blue-600'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${comment.is_liked ? 'fill-current' : ''}`}
                />
                <span className="font-medium">{comment.likes || 0}</span>
              </button>

              {canReply && (
                <button
                  onClick={() => setShowReplyBox(!showReplyBox)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="font-medium">Reply</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reply Box */}
        {showReplyBox && (
          <div className="mt-3 ml-11">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none text-sm text-slate-700"
              rows={2}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSubmitReply}
                disabled={isSubmitting || !replyContent.trim()}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Posting...' : 'Reply'}
              </button>
              <button
                onClick={() => {
                  setShowReplyBox(false);
                  setReplyContent('');
                }}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <UserComment
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              onLike={onLike}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserComment;