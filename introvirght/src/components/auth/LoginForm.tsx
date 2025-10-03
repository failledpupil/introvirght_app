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
    <div 
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e5e7eb',
        padding: '24px',
        maxWidth: '28rem',
        margin: '0 auto'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 
            style={{
              fontSize: '24px',
              fontFamily: 'serif',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}
          >
            Welcome Back
          </h2>
          <p 
            style={{
              color: '#6b7280',
              fontSize: '14px',
              margin: 0
            }}
          >
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label 
              htmlFor="email" 
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
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
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: hasFieldError(fieldErrors, 'email') ? '1px solid #fca5a5' : '1px solid #d1d5db',
                backgroundColor: 'white',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your email address"
              disabled={isLoading}
            />
            {hasFieldError(fieldErrors, 'email') && (
              <p style={{ color: '#dc2626', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{getFieldError(fieldErrors, 'email')}</span>
              </p>
            )}
          </div>

          {/* Password Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label 
              htmlFor="password" 
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
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
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: hasFieldError(fieldErrors, 'password') ? '1px solid #fca5a5' : '1px solid #d1d5db',
                backgroundColor: 'white',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {hasFieldError(fieldErrors, 'password') && (
              <p style={{ color: '#dc2626', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{getFieldError(fieldErrors, 'password')}</span>
              </p>
            )}
          </div>

          {/* Quick Test Login */}
          <div 
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '16px'
            }}
          >
            <p 
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#1e40af',
                marginBottom: '8px'
              }}
            >
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
              style={{
                color: '#2563eb',
                textDecoration: 'underline',
                fontSize: '14px',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Fill test credentials
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || fieldErrors.length > 0}
            style={{
              width: '100%',
              background: 'linear-gradient(to right, #3b82f6, #6366f1)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: '600',
              border: 'none',
              cursor: isLoading || fieldErrors.length > 0 ? 'not-allowed' : 'pointer',
              opacity: isLoading || fieldErrors.length > 0 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '16px'
            }}
          >
            {isLoading ? (
              <>
                <div 
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}
                ></div>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Switch to Register */}
        {onSwitchToRegister && (
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              New to Introvirght?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Create an account
              </button>
            </p>
          </div>
        )}

        {/* Inspirational Quote */}
        <div className="text-center pt-4">
          <p className="text-gray-500 text-sm italic font-serif">
            "The journey inward is the most important journey of all."
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;