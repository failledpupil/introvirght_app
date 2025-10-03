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
          className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-100 focus:border-sage-300 transition-all duration-200"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isSearching ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sage-500"></div>
          ) : (
            <svg className="h-4 w-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-stone-200 max-h-96 overflow-y-auto z-50">
          {query.length < 2 ? (
            <div className="p-4 text-center text-stone-500 text-sm">
              Type at least 2 characters to search
            </div>
          ) : totalResults === 0 && !isSearching ? (
            <div className="p-4 text-center text-stone-500 text-sm">
              No results found for "{query}"
            </div>
          ) : (
            <div className="py-2">
              {/* Posts Section */}
              {results.posts.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-medium text-stone-500 uppercase tracking-wide border-b border-stone-100">
                    Posts
                  </div>
                  {results.posts.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => handleResultClick(post, 'post')}
                      className="w-full px-4 py-3 text-left hover:bg-stone-50 transition-colors duration-200 border-b border-stone-50 last:border-b-0"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-sage-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sage-700 text-sm font-medium">
                            {post.author?.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-stone-800 text-sm">
                              {post.author?.username}
                            </span>
                            <span className="text-stone-400 text-xs">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-stone-600 text-sm line-clamp-2">
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
                  {results.posts.length > 0 && <div className="border-t border-stone-200"></div>}
                  <div className="px-4 py-2 text-xs font-medium text-stone-500 uppercase tracking-wide border-b border-stone-100">
                    Users
                  </div>
                  {results.users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleResultClick(user, 'user')}
                      className="w-full px-4 py-3 text-left hover:bg-stone-50 transition-colors duration-200 border-b border-stone-50 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-sage-100 rounded-full flex items-center justify-center">
                          <span className="text-sage-700 text-sm font-medium">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-stone-800 text-sm">
                            {user.username}
                          </div>
                          {user.bio && (
                            <p className="text-stone-500 text-xs truncate">
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