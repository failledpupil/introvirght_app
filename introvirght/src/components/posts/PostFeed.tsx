import React, { useState, useEffect, useCallback } from 'react';
import type { Post } from '../../types';
import { PostService } from '../../services/postService';
import PostCard from './PostCard';
import LoadingSpinner from '../LoadingSpinner';

interface PostFeedProps {
  feedType: 'feed' | 'recent' | 'user';
  username?: string; // Required for 'user' feedType
  className?: string;
}

const PostFeed: React.FC<PostFeedProps> = ({ feedType, username, className = '' }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const loadPosts = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      let response;
      switch (feedType) {
        case 'feed':
          response = await PostService.getFeedPosts(pageNum);
          break;
        case 'recent':
          response = await PostService.getRecentPosts(pageNum);
          break;
        case 'user':
          if (!username) {
            throw new Error('Username is required for user feed');
          }
          response = await PostService.getUserPosts(username, pageNum);
          break;
        default:
          throw new Error('Invalid feed type');
      }

      if (response.success && response.data) {
        const newPosts = response.data.posts.map(post => ({
          ...post,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt),
          isLikedByCurrentUser: Boolean(post.isLikedByCurrentUser),
          isRepostedByCurrentUser: Boolean(post.isRepostedByCurrentUser),
        }));

        if (append) {
          setPosts(prev => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }
        
        setHasMore(response.data.hasMore);
        setPage(pageNum);
      } else {
        setError(response.error?.message || 'Failed to load posts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [feedType, username]);

  // Initial load
  useEffect(() => {
    loadPosts(1, false);
  }, [loadPosts]);

  // Load more posts
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadPosts(page + 1, true);
    }
  };

  // Handle post updates
  const handlePostUpdated = (updatedPost: Post) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  // Handle post deletion
  const handlePostDeleted = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  // Handle new post creation (for feed refresh)
  // const handleNewPost = (newPost: Post) => {
  //   setPosts(prev => [newPost, ...prev]);
  // };

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" message="Loading your mindful feed..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card text-center ${className}`} style={{ 
        paddingTop: 'var(--space-12)', 
        paddingBottom: 'var(--space-12)' 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <svg style={{ 
            width: '48px', 
            height: '48px', 
            color: 'var(--neutral-400)', 
            margin: '0 auto' 
          }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 style={{ 
              fontSize: 'var(--text-lg)', 
              fontWeight: '500', 
              color: 'var(--primary)', 
              marginBottom: 'var(--space-2)' 
            }}>
              Unable to Load Posts
            </h3>
            <p style={{ 
              color: 'var(--neutral-600)', 
              marginBottom: 'var(--space-4)' 
            }}>
              {error}
            </p>
            <button
              onClick={() => loadPosts(1, false)}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={`card text-center ${className}`} style={{ 
        paddingTop: 'var(--space-12)', 
        paddingBottom: 'var(--space-12)' 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            backgroundColor: 'var(--neutral-100)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto' 
          }}>
            <svg style={{ width: '32px', height: '32px', color: 'var(--secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <div>
            <h3 style={{ 
              fontSize: 'var(--text-lg)', 
              fontWeight: '500', 
              color: 'var(--primary)', 
              marginBottom: 'var(--space-2)' 
            }}>
              {feedType === 'feed' ? 'Your Feed is Quiet' : 
               feedType === 'user' ? 'No Posts Yet' : 
               'No Recent Posts'}
            </h3>
            <p style={{ 
              color: 'var(--neutral-600)', 
              fontSize: 'var(--text-sm)' 
            }}>
              {feedType === 'feed' 
                ? 'Follow others to see their thoughtful posts in your feed, or share your first post to get started.'
                : feedType === 'user'
                ? 'This user hasn\'t shared any thoughts yet.'
                : 'Be the first to share something meaningful with the community.'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Posts */}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onPostUpdated={handlePostUpdated}
          onPostDeleted={handlePostDeleted}
        />
      ))}

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-6)' }}>
          {loadingMore ? (
            <LoadingSpinner size="md" message="Loading more posts..." />
          ) : (
            <button
              onClick={loadMore}
              className="btn-secondary"
            >
              Load More Posts
            </button>
          )}
        </div>
      )}

      {/* End of Feed */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              backgroundColor: 'var(--neutral-100)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto' 
            }}>
              <svg style={{ width: '16px', height: '16px', color: 'var(--secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p style={{ 
              color: 'var(--neutral-500)', 
              fontSize: 'var(--text-sm)', 
              fontStyle: 'italic' 
            }}>
              You've reached the end of this mindful journey
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostFeed;