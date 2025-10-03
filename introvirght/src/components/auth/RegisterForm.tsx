import React, { useState, useEffect } from 'react';
import type { RegisterData, ValidationError } from '../../types';
import { validateFieldRealTime, getFieldError, hasFieldError } from '../../utils/validation';
import { useAuthContext } from '../../contexts/AuthContext';
import { UserService } from '../../services/userService';
import { debounce } from '../../utils';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const { register, isLoading, error, clearError } = useAuthContext();
  
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
  });
  
  const [fieldErrors, setFieldErrors] = useState<ValidationError[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [usernameAvailability, setUsernameAvailability] = useState<{
    checking: boolean;
    available: boolean | null;
    message?: string;
  }>({ checking: false, available: null });

  // Debounced username availability check - temporarily disabled for testing
  const checkUsernameAvailability = debounce(async (username: string) => {
    // Temporarily disabled to speed up registration
    setUsernameAvailability({ checking: false, available: true });
    return;
    
    if (username.length < 3) {
      setUsernameAvailability({ checking: false, available: null });
      return;
    }

    setUsernameAvailability({ checking: true, available: null });
    
    try {
      const response = await UserService.checkUsernameAvailability(username);
      if (response.success && response.data) {
        setUsernameAvailability({
          checking: false,
          available: response.data?.available || false,
          message: response.data?.reason || 'Unknown error',
        });
      }
    } catch (error) {
      setUsernameAvailability({ checking: false, available: null });
    }
  }, 500);

  useEffect(() => {
    if (formData.username && touched.username) {
      checkUsernameAvailability(formData.username);
    }
  }, [formData.username, touched.username]);

  const handleInputChange = (field: keyof RegisterData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear any global error when user starts typing
    if (error) {
      clearError();
    }

    // Real-time validation for touched fields
    if (touched[field]) {
      const errors = validateFieldRealTime(field, value || '', formData);
      setFieldErrors(prev => [
        ...prev.filter(err => err.field !== field),
        ...errors,
      ]);
    }
  };

  const handleBlur = (field: keyof RegisterData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate field on blur
    const errors = validateFieldRealTime(field, formData[field] || '', formData);
    setFieldErrors(prev => [
      ...prev.filter(err => err.field !== field),
      ...errors,
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 RegisterForm: Submit started', formData);
    
    // Mark all fields as touched
    const allFields = ['username', 'email', 'password', 'confirmPassword', 'bio'];
    setTouched(Object.fromEntries(allFields.map(field => [field, true])));
    
    // Validate all fields
    const allErrors: ValidationError[] = [];
    allFields.forEach(field => {
      const errors = validateFieldRealTime(field, formData[field as keyof RegisterData] || '', formData);
      allErrors.push(...errors);
    });
    
    console.log('🔍 RegisterForm: Validation errors', allErrors);
    
    // Check username availability
    if (usernameAvailability.available === false) {
      allErrors.push({
        field: 'username',
        message: usernameAvailability.message || 'Username is not available',
      });
    }
    
    setFieldErrors(allErrors);
    
    if (allErrors.length > 0) {
      console.log('❌ RegisterForm: Validation failed, not submitting');
      return;
    }

    console.log('✅ RegisterForm: Validation passed, calling register');
    const result = await register(formData);
    
    console.log('🔍 RegisterForm: Register result', result);
    
    if (result.success) {
      console.log('✅ RegisterForm: Registration successful, calling onSuccess');
      onSuccess?.();
    }
  };

  const getCharacterCount = (text: string, limit: number) => {
    const remaining = limit - text.length;
    const percentage = (text.length / limit) * 100;
    
    let colorClass = 'text-stone-400';
    if (percentage > 80) colorClass = 'text-sage-500';
    if (percentage > 90) colorClass = 'text-lavender-500';
    if (percentage >= 100) colorClass = 'text-red-500';
    
    return { remaining, colorClass };
  };

  const bioCount = getCharacterCount(formData.bio || '', 160);

  return (
    <div className="card-elevated" style={{ maxWidth: '28rem', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Header */}
        <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <h2 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: '600',
            color: 'var(--primary)',
            margin: 0
          }}>
            Join Introvirght
          </h2>
          <p style={{
            color: 'var(--neutral-600)',
            fontSize: 'var(--text-sm)',
            margin: 0
          }}>
            Begin your journey of mindful self-expression
          </p>
        </div>

        {/* Global Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Username Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label htmlFor="username" style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: '500',
              color: 'var(--neutral-700)'
            }}>
              Username
            </label>
            <div className="relative">
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                onBlur={() => handleBlur('username')}
                className={`input-field ${
                  hasFieldError(fieldErrors, 'username') || usernameAvailability.available === false
                    ? 'border-red-300' 
                    : usernameAvailability.available === true
                    ? 'border-green-300'
                    : ''
                }`}
                placeholder="Choose a unique username"
                disabled={isLoading}
              />
              {usernameAvailability.checking && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sage-500"></div>
                </div>
              )}
              {usernameAvailability.available === true && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            {hasFieldError(fieldErrors, 'username') && (
              <p className="text-red-600 text-sm flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{getFieldError(fieldErrors, 'username')}</span>
              </p>
            )}
            {usernameAvailability.available === false && (
              <p className="text-red-600 text-sm flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{usernameAvailability.message}</span>
              </p>
            )}
            {usernameAvailability.available === true && (
              <p className="text-green-600 text-sm flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Username is available!</span>
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-stone-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={`input-gentle ${
                hasFieldError(fieldErrors, 'email') ? 'border-red-300 focus:border-red-300 focus:ring-red-100' : ''
              }`}
              placeholder="Enter your email address"
              disabled={isLoading}
            />
            {hasFieldError(fieldErrors, 'email') && (
              <p className="text-red-600 text-sm flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{getFieldError(fieldErrors, 'email')}</span>
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-stone-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              className={`input-gentle ${
                hasFieldError(fieldErrors, 'password') ? 'border-red-300 focus:border-red-300 focus:ring-red-100' : ''
              }`}
              placeholder="Create a secure password"
              disabled={isLoading}
            />
            {hasFieldError(fieldErrors, 'password') && (
              <p className="text-red-600 text-sm flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{getFieldError(fieldErrors, 'password')}</span>
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              className={`input-gentle ${
                hasFieldError(fieldErrors, 'confirmPassword') ? 'border-red-300 focus:border-red-300 focus:ring-red-100' : ''
              }`}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
            {hasFieldError(fieldErrors, 'confirmPassword') && (
              <p className="text-red-600 text-sm flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{getFieldError(fieldErrors, 'confirmPassword')}</span>
              </p>
            )}
          </div>

          {/* Bio Field */}
          <div className="space-y-2">
            <label htmlFor="bio" className="block text-sm font-medium text-stone-700">
              Bio <span className="text-stone-500 font-normal">(optional)</span>
            </label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              onBlur={() => handleBlur('bio')}
              className={`input-gentle resize-none h-20 ${
                hasFieldError(fieldErrors, 'bio') ? 'border-red-300 focus:border-red-300 focus:ring-red-100' : ''
              }`}
              placeholder="Tell others a bit about yourself..."
              disabled={isLoading}
              maxLength={160}
            />
            <div className="flex justify-between items-center">
              {hasFieldError(fieldErrors, 'bio') ? (
                <p className="text-red-600 text-sm flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{getFieldError(fieldErrors, 'bio')}</span>
                </p>
              ) : (
                <div></div>
              )}
              <p className={`text-xs ${bioCount.colorClass}`}>
                {bioCount.remaining} characters remaining
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
            style={{
              opacity: isLoading ? 0.5 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)'
            }}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                <span>Creating account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Switch to Login */}
        {onSwitchToLogin && (
          <div className="text-center" style={{ 
            paddingTop: 'var(--space-4)', 
            borderTop: '1px solid var(--neutral-200)' 
          }}>
            <p style={{ color: 'var(--neutral-600)', fontSize: 'var(--text-sm)' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="btn-ghost"
                style={{ 
                  padding: '0', 
                  fontSize: 'var(--text-sm)',
                  fontWeight: '500'
                }}
              >
                Sign in
              </button>
            </p>
          </div>
        )}

        {/* Inspirational Quote */}
        <div className="text-center" style={{ paddingTop: 'var(--space-4)' }}>
          <p style={{ 
            color: 'var(--neutral-500)', 
            fontSize: 'var(--text-sm)', 
            fontStyle: 'italic' 
          }}>
            "Every journey begins with a single step towards authenticity."
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;