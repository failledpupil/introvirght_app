import React, { useState, useRef, useEffect } from 'react';
import type { CreatePostData, ValidationError } from '../../types';
import { validateFieldRealTime, getFieldError, hasFieldError } from '../../utils/validation';
import { getCharacterCountColor, getInspirationPrompt } from '../../utils';
import { PostService } from '../../services/postService';
import { useAuthContext } from '../../contexts/AuthContext';

interface ComposeBoxProps {
  onPostCreated?: (post: any) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

const ComposeBox: React.FC<ComposeBoxProps> = ({ 
  onPostCreated, 
  placeholder,
  autoFocus = false,
  className = '' 
}) => {
  const { user, isAuthenticated } = useAuthContext();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [touched, setTouched] = useState(false);
  const [inspirationPrompt, setInspirationPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Generate inspiration prompt on mount
  useEffect(() => {
    setInspirationPrompt(getInspirationPrompt());
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleContentChange = (value: string) => {
    setContent(value);
    
    // Real-time validation for touched field
    if (touched) {
      const validationErrors = validateFieldRealTime('content', value);
      setErrors(validationErrors);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    const validationErrors = validateFieldRealTime('content', content);
    setErrors(validationErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      return;
    }

    setTouched(true);
    
    // Validate content
    const validationErrors = validateFieldRealTime('content', content);
    setErrors(validationErrors);
    
    if (validationErrors.length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const postData: CreatePostData = { content: content.trim() };
      const response = await PostService.createPost(postData);

      if (response.success && response.data) {
        // Clear form
        setContent('');
        setTouched(false);
        setErrors([]);
        
        // Generate new inspiration prompt
        setInspirationPrompt(getInspirationPrompt());
        
        // Notify parent component
        onPostCreated?.(response.data);
        
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      } else {
        setErrors([{
          field: 'content',
          message: response.error?.message || 'Failed to create post'
        }]);
      }
    } catch (error) {
      setErrors([{
        field: 'content',
        message: 'An unexpected error occurred'
      }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const characterCount = content.length;
  const characterLimit = 500;
  const countColor = getCharacterCountColor(characterCount, characterLimit);
  const isOverLimit = characterCount > characterLimit;
  const canSubmit = isAuthenticated && content.trim().length > 0 && !isOverLimit && errors.length === 0;

  if (!isAuthenticated) {
    return (
      <div className={`card-gentle ${className}`}>
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-stone-800 mb-2">Share Your Thoughts</h3>
            <p className="text-stone-600 text-sm mb-4">
              Sign in to share your mindful reflections with the community
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card-gentle ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center">
            <span className="text-sage-700 font-medium">
              {user?.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-stone-800">{user?.username}</p>
            <p className="text-stone-500 text-sm text-inspirational">
              {inspirationPrompt}
            </p>
          </div>
        </div>

        {/* Content Input */}
        <div className="space-y-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onBlur={handleBlur}
            className={`w-full px-0 py-2 border-0 bg-transparent resize-none focus:outline-none text-stone-800 placeholder-stone-400 text-lg leading-relaxed ${
              hasFieldError(errors, 'content') ? 'text-red-600' : ''
            }`}
            placeholder={placeholder || "What's bringing you peace today?"}
            rows={3}
            disabled={isSubmitting}
            style={{ minHeight: '80px', maxHeight: '300px' }}
          />
          
          {/* Error Message */}
          {hasFieldError(errors, 'content') && (
            <p className="text-red-600 text-sm flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{getFieldError(errors, 'content')}</span>
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          {/* Character Count */}
          <div className="flex items-center space-x-4">
            <span className={`text-sm ${countColor}`}>
              {characterCount}/{characterLimit}
            </span>
            {characterCount > characterLimit * 0.8 && (
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  isOverLimit ? 'bg-red-400' : 
                  characterCount > characterLimit * 0.9 ? 'bg-lavender-400' : 'bg-sage-400'
                }`}></div>
                <span className="text-xs text-stone-500">
                  {isOverLimit ? 'Over limit' : 'Approaching limit'}
                </span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 px-6 py-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Sharing...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Gentle Encouragement */}
      {content.length === 0 && !touched && (
        <div className="mt-4 pt-4 border-t border-stone-100">
          <p className="text-stone-500 text-sm text-center text-inspirational">
            "Every authentic thought shared is a step towards deeper connection."
          </p>
        </div>
      )}
    </div>
  );
};

export default ComposeBox;