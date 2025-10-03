import React, { useState } from 'react';
import { FollowService } from '../services/followService';
import { useAuthContext } from '../contexts/AuthContext';

interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
  onFollowChange?: (following: boolean, followerCount: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  initialFollowing = false,
  onFollowChange,
  size = 'md',
  className = ''
}) => {
  const { isAuthenticated, user } = useAuthContext();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);

  // Don't show follow button for own profile
  if (!isAuthenticated || !user || user.id === userId) {
    return null;
  }

  const handleToggleFollow = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = isFollowing 
        ? await FollowService.unfollowUser(userId)
        : await FollowService.followUser(userId);

      if (response.success && response.data) {
        const newFollowingState = response.data.following;
        setIsFollowing(newFollowingState);
        onFollowChange?.(newFollowingState, response.data.followerCount);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const baseClasses = `${sizeClasses[size]} rounded-lg font-medium transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`;

  if (isFollowing) {
    return (
      <button
        onClick={handleToggleFollow}
        disabled={isLoading}
        className={`${baseClasses} bg-sage-100 text-sage-700 border border-sage-200 hover:bg-sage-200 hover:border-sage-300 ${className}`}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sage-600"></div>
            <span>Following...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Following</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleFollow}
      disabled={isLoading}
      className={`${baseClasses} bg-sage-500 text-white hover:bg-sage-600 shadow-sm hover:shadow-md ${className}`}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Following...</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Follow</span>
        </>
      )}
    </button>
  );
};

export default FollowButton;