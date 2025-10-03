import React, { useState } from 'react';

interface BasicLoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

const BasicLoginForm: React.FC<BasicLoginFormProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error?.message || 'Login failed');
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Force page reload to update auth state
        window.location.reload();
      } else {
        setError('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Unable to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 max-w-md mx-auto">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-serif font-semibold text-sage-700">
            Welcome Back
          </h2>
          <p className="text-stone-600">
            Continue your journey of mindful connection
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-stone-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
              placeholder="Enter your email address"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-stone-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
              placeholder="Enter your password"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full bg-sage-600 text-white py-2 px-4 rounded-lg hover:bg-sage-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Test Credentials:</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>Email:</strong> testuser123@example.com</p>
            <p><strong>Password:</strong> password123</p>
            <button
              type="button"
              onClick={() => {
                setEmail('testuser123@example.com');
                setPassword('password123');
              }}
              className="mt-2 text-blue-600 hover:text-blue-800 underline"
            >
              Fill test credentials
            </button>
          </div>
        </div>

        {onSwitchToRegister && (
          <div className="text-center pt-4 border-t border-stone-200">
            <p className="text-stone-600 text-sm">
              New to Introvirght?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-sage-600 hover:text-sage-700 font-medium"
              >
                Create an account
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicLoginForm;