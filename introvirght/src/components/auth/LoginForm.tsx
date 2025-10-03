import React, { useState } from 'react';
import type { LoginCredentials, ValidationError } from '../../types';
import { validateFieldRealTime, getFieldError, hasFieldError } from '../../utils/validation';
import { useAuthContext } from '../../contexts/AuthContext';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const { login, isLoading, error, clearError } = useAuthContext();
  
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  
  const [fieldErrors, setFieldErrors] = useState<ValidationError[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear any global error when user starts typing
    if (error) {
      clearError();
    }

    // Real-time validation for touched fields
    if (touched[field]) {
      const errors = validateFieldRealTime(field, value);
      setFieldErrors(prev => [
        ...prev.filter(err => err.field !== field),
        ...errors,
      ]);
    }
  };

  const handleBlur = (field: keyof LoginCredentials) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate field on blur
    const errors = validateFieldRealTime(field, formData[field]);
    setFieldErrors(prev => [
      ...prev.filter(err => err.field !== field),
      ...errors,
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ email: true, password: true });
    
    // Validate all fields
    const emailErrors = validateFieldRealTime('email', formData.email);
    const passwordErrors = validateFieldRealTime('password', formData.password);
    const allErrors = [...emailErrors, ...passwordErrors];
    
    setFieldErrors(allErrors);
    
    if (allErrors.length > 0) {
      return;
    }

    try {
      const result = await login(formData);
      
      if (result.success) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Login error:', error);
      // The error will be handled by the auth context
    }
  };

  return (
    <div className="card-elevated" style={{ maxWidth: '28rem', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <h2 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: '600',
            color: 'var(--primary)',
            margin: 0
          }}>
            Welcome Back
          </h2>
          <p style={{
            color: 'var(--neutral-600)',
            fontSize: 'var(--text-sm)',
            margin: 0
          }}>
            Continue your journey of mindful connection
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
          {/* Email Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label 
              htmlFor="email" 
              style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: '500',
                color: 'var(--neutral-700)'
              }}
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={`input-field ${hasFieldError(fieldErrors, 'email') ? 'border-red-300' : ''}`}
              placeholder="Enter your email address"
              disabled={isLoading}
            />
            {hasFieldError(fieldErrors, 'email') && (
              <p style={{ color: '#ef4444', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{getFieldError(fieldErrors, 'email')}</span>
              </p>
            )}
          </div>

          {/* Password Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label 
              htmlFor="password" 
              style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: '500',
                color: 'var(--neutral-700)'
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              className={`input-field ${hasFieldError(fieldErrors, 'password') ? 'border-red-300' : ''}`}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {hasFieldError(fieldErrors, 'password') && (
              <p style={{ color: '#ef4444', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{getFieldError(fieldErrors, 'password')}</span>
              </p>
            )}
          </div>

          {/* Quick Test Login */}
          <div className="bg-accent-subtle" style={{
            border: '1px solid var(--neutral-200)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)'
          }}>
            <p style={{
              fontSize: 'var(--text-sm)',
              fontWeight: '500',
              color: 'var(--secondary)',
              marginBottom: 'var(--space-2)'
            }}>
              Quick Test Login:
            </p>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  email: 'testuser123@example.com',
                  password: 'password123'
                });
              }}
              className="btn-ghost"
              style={{ padding: '0', fontSize: 'var(--text-sm)' }}
            >
              Fill test credentials
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || fieldErrors.length > 0}
            className="btn-primary w-full"
            style={{
              opacity: isLoading || fieldErrors.length > 0 ? 0.5 : 1,
              cursor: isLoading || fieldErrors.length > 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)'
            }}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Switch to Register */}
        {onSwitchToRegister && (
          <div className="text-center" style={{ 
            paddingTop: 'var(--space-4)', 
            borderTop: '1px solid var(--neutral-200)' 
          }}>
            <p style={{ color: 'var(--neutral-600)', fontSize: 'var(--text-sm)' }}>
              New to Introvirght?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="btn-ghost"
                style={{ 
                  padding: '0', 
                  fontSize: 'var(--text-sm)',
                  fontWeight: '500'
                }}
              >
                Create an account
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
            "The journey inward is the most important journey of all."
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;