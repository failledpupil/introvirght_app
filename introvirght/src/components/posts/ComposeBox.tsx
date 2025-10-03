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
      <div className={`card ${className}`}>
        <div className="text-center" style={{ 
          paddingTop: 'var(--space-8)', 
          paddingBottom: 'var(--space-8)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)'
        }}>
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
              Share Your Thoughts
            </h3>
            <p style={{ 
              color: 'var(--neutral-600)', 
              fontSize: 'var(--text-sm)' 
            }}>
              Sign in to share your mindful reflections with the community
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${className}`}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Header */}
        <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            backgroundColor: 'var(--neutral-100)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <span style={{ 
              color: 'var(--secondary)', 
              fontWeight: '500' 
            }}>
              {user?.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p style={{ fontWeight: '500', color: 'var(--primary)' }}>{user?.username}</p>
            <p style={{ 
              color: 'var(--neutral-500)', 
              fontSize: 'var(--text-sm)', 
              fontStyle: 'italic' 
            }}>
              {inspirationPrompt}
            </p>
          </div>
        </div>

        {/* Content Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onBlur={handleBlur}
            style={{
              width: '100%',
              padding: 'var(--space-2) 0',
              border: '0',
              backgroundColor: 'transparent',
              resize: 'none',
              outline: 'none',
              color: hasFieldError(errors, 'content') ? '#ef4444' : 'var(--primary)',
              fontSize: 'var(--text-lg)',
              lineHeight: '1.6',
              minHeight: '80px',
              maxHeight: '300px'
            }}
            placeholder={placeholder || "What's bringing you peace today?"}
            rows={3}
            disabled={isSubmitting}
          />
          
          {/* Error Message */}
          {hasFieldError(errors, 'content') && (
            <p style={{ 
              color: '#ef4444', 
              fontSize: 'var(--text-sm)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-1)' 
            }}>
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{getFieldError(errors, 'content')}</span>
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between" style={{ 
          paddingTop: 'var(--space-3)', 
          borderTop: '1px solid var(--neutral-200)' 
        }}>
          {/* Character Count */}
          <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: countColor }}>
              {characterCount}/{characterLimit}
            </span>
            {characterCount > characterLimit * 0.8 && (
              <div className="flex items-center" style={{ gap: 'var(--space-1)' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isOverLimit ? '#ef4444' : 
                    characterCount > characterLimit * 0.9 ? '#f59e0b' : 'var(--secondary)'
                }}></div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)' }}>
                  {isOverLimit ? 'Over limit' : 'Approaching limit'}
                </span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="btn-primary"
            style={{
              opacity: !canSubmit || isSubmitting ? 0.5 : 1,
              cursor: !canSubmit || isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}
          >
            {isSubmitting ? (
              <>
                <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                <span>Sharing...</span>
              </>
            ) : (
              <>
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div style={{ 
          marginTop: 'var(--space-4)', 
          paddingTop: 'var(--space-4)', 
          borderTop: '1px solid var(--neutral-200)' 
        }}>
          <p className="text-center" style={{ 
            color: 'var(--neutral-500)', 
            fontSize: 'var(--text-sm)', 
            fontStyle: 'italic' 
          }}>
            "Every authentic thought shared is a step towards deeper connection."
          </p>
        </div>
      )}
    </div>
  );
};

export default ComposeBox;