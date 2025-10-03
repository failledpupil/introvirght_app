import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { UserService } from '../services/userService';
import { useAuthContext } from '../contexts/AuthContext';
import FollowButton from './FollowButton';
import { PostFeed } from './posts';
import { formatDate } from '../utils';

interface UserProfileProps {
  username: string;
  className?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ username, className = '' }) => {
  const { user: currentUser, isAuthenticated } = useAuthContext();
  const [user, setUser] = useState<User & {
    followerCount: number;
    followingCount: number;
    postCount: number;
    isFollowing?: boolean;
    isFollowedBy?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await UserService.getUserProfile(username);
        if (response.success && response.data) {
          setUser(response.data as any); // Type assertion for extended user
        } else {
          setError(response.error?.message || 'User not found');
        }
      } catch (err) {
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [username]);

  const handleFollowChange = (following: boolean, followerCount: number) => {
    if (user) {
      setUser({
        ...user,
        isFollowing: following,
        followerCount,
      });
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="card-gentle animate-pulse">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-stone-200 rounded-full"></div>
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-stone-200 rounded w-1/3"></div>
              <div className="h-4 bg-stone-200 rounded w-2/3"></div>
              <div className="flex space-x-4">
                <div className="h-4 bg-stone-200 rounded w-16"></div>
                <div className="h-4 bg-stone-200 rounded w-16"></div>
                <div className="h-4 bg-stone-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={`card-gentle text-center py-12 ${className}`}>
        <div className="space-y-4">
          <svg className="w-12 h-12 text-stone-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <div>
            <h3 className="text-lg font-medium text-stone-800 mb-2">User Not Found</h3>
            <p className="text-stone-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = isAuthenticated && currentUser && currentUser.id === user.id;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Profile Header */}
      <div className="card-gentle">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {/* Avatar */}
            <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center">
              <span className="text-sage-700 text-2xl font-medium">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-serif font-semibold text-stone-800">
                  {user.username}
                </h1>
                {user.isFollowedBy && (
                  <span className="px-2 py-1 bg-lavender-100 text-lavender-700 text-xs rounded-full">
                    Follows you
                  </span>
                )}
              </div>

              {user.bio && (
                <p className="text-stone-600 mb-3 leading-relaxed">
                  {user.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-1">
                  <span className="font-medium text-stone-800">{user.postCount}</span>
                  <span className="text-stone-500">posts</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-medium text-stone-800">{user.followerCount}</span>
                  <span className="text-stone-500">followers</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-medium text-stone-800">{user.followingCount}</span>
                  <span className="text-stone-500">following</span>
                </div>
              </div>

              {/* Join Date */}
              <div className="mt-3 text-sm text-stone-500">
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {isOwnProfile ? (
              <button className="btn-secondary">
                Edit Profile
              </button>
            ) : (
              <FollowButton
                userId={user.id}
                initialFollowing={user.isFollowing}
                onFollowChange={handleFollowChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* Journey Reflection */}
      {user.postCount > 0 && (
        <div className="card-gentle text-center">
          <div className="space-y-2">
            <h3 className="font-medium text-stone-800">
              {isOwnProfile ? 'Your Mindful Journey' : `${user.username}'s Journey`}
            </h3>
            <p className="text-stone-600 text-sm text-inspirational">
              {isOwnProfile 
                ? "Reflecting on your authentic expressions and growth"
                : `Discovering the thoughtful shares from ${user.username}`
              }
            </p>
          </div>
        </div>
      )}

      {/* User Posts */}
      <PostFeed feedType="user" username={user.username} />
    </div>
  );
};

export default UserProfile;