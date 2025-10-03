import React, { useState, useEffect } from 'react';
import { PostService } from '../services/postService';
import { debounce } from '../utils';
import type { Post, User } from '../types';

interface SearchBarProps {
  onResultSelect?: (result: Post | User, type: 'post' | 'user') => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onResultSelect,
  placeholder = "Search posts and users...",
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    posts: Post[];
    users: User[];
  }>({ posts: [], users: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search function
  const debouncedSearch = debounce(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults({ posts: [], users: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const postsResponse = await PostService.searchPosts(searchQuery, 1, 5);

      const newResults = {
        posts: postsResponse.success ? postsResponse.data?.posts || [] : [],
        users: [], // User search would be implemented later
      };

      setResults(newResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults({ posts: [], users: [] });
    } finally {
      setIsSearching(false);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(query);
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(value.length > 0);
  };

  const handleResultClick = (result: Post | User, type: 'post' | 'user') => {
    onResultSelect?.(result, type);
    setShowResults(false);
    setQuery('');
  };

  const handleInputFocus = () => {
    if (query.length > 0) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding results to allow clicks
    setTimeout(() => setShowResults(false), 200);
  };

  const totalResults = results.posts.length + results.users.length;

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="input-field"
          style={{ paddingLeft: '40px' }}
        />
        <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none" style={{ paddingLeft: 'var(--space-3)' }}>
          {isSearching ? (
            <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
          ) : (
            <svg style={{ width: '16px', height: '16px', color: 'var(--neutral-400)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 z-50" style={{
          marginTop: 'var(--space-2)',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--neutral-200)',
          maxHeight: '384px',
          overflowY: 'auto'
        }}>
          {query.length < 2 ? (
            <div className="text-center" style={{ 
              padding: 'var(--space-4)', 
              color: 'var(--neutral-500)', 
              fontSize: 'var(--text-sm)' 
            }}>
              Type at least 2 characters to search
            </div>
          ) : totalResults === 0 && !isSearching ? (
            <div className="text-center" style={{ 
              padding: 'var(--space-4)', 
              color: 'var(--neutral-500)', 
              fontSize: 'var(--text-sm)' 
            }}>
              No results found for "{query}"
            </div>
          ) : (
            <div style={{ padding: 'var(--space-2) 0' }}>
              {/* Posts Section */}
              {results.posts.length > 0 && (
                <div>
                  <div style={{ 
                    padding: 'var(--space-2) var(--space-4)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: '500',
                    color: 'var(--neutral-500)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid var(--neutral-100)'
                  }}>
                    Posts
                  </div>
                  {results.posts.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => handleResultClick(post, 'post')}
                      className="w-full hover:bg-gray-50 transition-colors"
                      style={{
                        padding: 'var(--space-3) var(--space-4)',
                        textAlign: 'left',
                        borderBottom: '1px solid var(--neutral-100)'
                      }}
                    >
                      <div className="flex items-start" style={{ gap: 'var(--space-3)' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: 'var(--neutral-100)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <span style={{
                            color: 'var(--secondary)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: '500'
                          }}>
                            {post.author?.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                            <span style={{
                              fontWeight: '500',
                              color: 'var(--primary)',
                              fontSize: 'var(--text-sm)'
                            }}>
                              {post.author?.username}
                            </span>
                            <span style={{
                              color: 'var(--neutral-400)',
                              fontSize: 'var(--text-xs)'
                            }}>
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p style={{
                            color: 'var(--neutral-600)',
                            fontSize: 'var(--text-sm)',
                            lineHeight: '1.4',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {post.content}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Users Section */}
              {results.users.length > 0 && (
                <div>
                  {results.posts.length > 0 && <div style={{ borderTop: '1px solid var(--neutral-200)' }}></div>}
                  <div style={{ 
                    padding: 'var(--space-2) var(--space-4)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: '500',
                    color: 'var(--neutral-500)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid var(--neutral-100)'
                  }}>
                    Users
                  </div>
                  {results.users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleResultClick(user, 'user')}
                      className="w-full hover:bg-gray-50 transition-colors"
                      style={{
                        padding: 'var(--space-3) var(--space-4)',
                        textAlign: 'left',
                        borderBottom: '1px solid var(--neutral-100)'
                      }}
                    >
                      <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: 'var(--neutral-100)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{
                            color: 'var(--secondary)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: '500'
                          }}>
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div style={{
                            fontWeight: '500',
                            color: 'var(--primary)',
                            fontSize: 'var(--text-sm)'
                          }}>
                            {user.username}
                          </div>
                          {user.bio && (
                            <p style={{
                              color: 'var(--neutral-500)',
                              fontSize: 'var(--text-xs)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {user.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;