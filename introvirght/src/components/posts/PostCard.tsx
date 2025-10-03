import React, { useState } from 'react';
import type { Post } from '../../types';
import { formatDate, formatEngagementCount, canEditPost } from '../../utils';
import { PostService } from '../../services/postService';
import { useAuthContext } from '../../contexts/AuthContext';

interface PostCardProps {
  post: Post;
  onPostUpdated?: (post: Post) => void;
  onPostDeleted?: (postId: string) => void;
  showActions?: boolean;
  className?: string;
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onPostUpdated, 
  onPostDeleted,
  showActions = true,
  className = '' 
}) => {
  const { user, isAuthenticated } = useAuthContext();
  const [isLiking, setIsLiking] = useState(false);
  const [isReposting, setIsReposting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [localPost, setLocalPost] = useState(post);

  const isOwnPost = Boolean(isAuthenticated && user && localPost.authorId === user.id);
  const canEdit = isOwnPost && user && canEditPost(localPost, user.id);

  const handleLike = async () => {
    if (!isAuthenticated || isLiking) return;

    setIsLiking(true);
    try {
      const response = await PostService.likePost(localPost.id);
      if (response.success && response.data) {
        const updatedPost = {
          ...localPost,
          isLikedByCurrentUser: Boolean(response.data.liked),
          likeCount: response.data.likeCount,
        };
        setLocalPost(updatedPost);
        onPostUpdated?.(updatedPost);
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleRepost = async () => {
    if (!isAuthenticated || isReposting || isOwnPost) return;

    setIsReposting(true);
    try {
      const response = await PostService.repost(localPost.id);
      if (response.success && response.data) {
        const updatedPost = {
          ...localPost,
          isRepostedByCurrentUser: Boolean(response.data.reposted),
          repostCount: response.data.repostCount,
        };
        setLocalPost(updatedPost);
        onPostUpdated?.(updatedPost);
      }
    } catch (error) {
      console.error('Failed to repost:', error);
    } finally {
      setIsReposting(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwnPost || !window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await PostService.deletePost(localPost.id);
      if (response.success) {
        onPostDeleted?.(localPost.id);
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const formatPostContent = (content: string) => {
    // Simple formatting for mentions and hashtags
    return content
      .replace(/@([a-zA-Z0-9_]+)/g, '<span class="text-sage-600 font-medium">@$1</span>')
      .replace(/#([a-zA-Z0-9_]+)/g, '<span class="text-lavender-600 font-medium">#$1</span>');
  };

  return (
    <article className={`card-gentle hover:shadow-md transition-all duration-200 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center">
            <span className="text-sage-700 font-medium">
              {localPost.author?.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-stone-800">
                {localPost.author?.username}
              </h3>
              <span className="text-stone-400">·</span>
              <time className="text-stone-500 text-sm" title={localPost.createdAt.toLocaleString()}>
                {formatDate(localPost.createdAt)}
              </time>
            </div>
            {localPost.author?.bio && (
              <p className="text-stone-500 text-sm">{localPost.author.bio}</p>
            )}
          </div>
        </div>

        {/* Menu */}
        {isOwnPost && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full hover:bg-stone-100 transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-stone-200 py-2 z-20">
                  {canEdit && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        // Edit functionality would be implemented here
                      }}
                      className="w-full text-left px-4 py-2 text-stone-700 hover:bg-stone-50 transition-colors duration-200"
                    >
                      Edit Post
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDelete();
                    }}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    Delete Post
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        <p 
          className="text-stone-800 leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: formatPostContent(localPost.content) }}
        />
      </div>

      {/* Repost Attribution */}
      {localPost.originalPost && (
        <div className="mb-4 p-3 bg-stone-50 rounded-lg border-l-4 border-sage-300">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-4 h-4 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span className="text-sm text-stone-600">Reposted</span>
          </div>
          <p className="text-stone-700 text-sm">
            {localPost.originalPost.content}
          </p>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <div className="flex items-center space-x-6">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={!isAuthenticated || isLiking}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-all duration-200 ${
                localPost.isLikedByCurrentUser === true
                  ? 'text-red-600 bg-red-50 hover:bg-red-100'
                  : 'text-stone-500 hover:text-red-600 hover:bg-red-50'
              } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className={`w-5 h-5 ${isLiking ? 'animate-pulse' : ''}`} fill={localPost.isLikedByCurrentUser === true ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm font-medium">
                {formatEngagementCount(localPost.likeCount)}
              </span>
            </button>

            {/* Repost Button */}
            <button
              onClick={handleRepost}
              disabled={!isAuthenticated || isReposting || isOwnPost}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-all duration-200 ${
                localPost.isRepostedByCurrentUser === true
                  ? 'text-green-600 bg-green-50 hover:bg-green-100'
                  : 'text-stone-500 hover:text-green-600 hover:bg-green-50'
              } ${!isAuthenticated || isOwnPost ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className={`w-5 h-5 ${isReposting ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className="text-sm font-medium">
                {formatEngagementCount(localPost.repostCount)}
              </span>
            </button>
          </div>

          {/* Share Button */}
          <button
            onClick={() => {
              // Share functionality would be implemented here
              if (navigator.share) {
                navigator.share({
                  title: `Post by ${localPost.author?.username}`,
                  text: localPost.content,
                  url: window.location.href,
                });
              }
            }}
            className="p-2 rounded-full text-stone-500 hover:text-sage-600 hover:bg-sage-50 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
        </div>
      )}

      {/* Gentle Encouragement for Engagement */}
      {localPost.likeCount === 0 && localPost.repostCount === 0 && !isOwnPost && (
        <div className="mt-3 pt-3 border-t border-stone-100">
          <p className="text-stone-400 text-xs text-center text-inspirational">
            Be the first to show appreciation for this thoughtful share
          </p>
        </div>
      )}
    </article>
  );
};

export default PostCard;