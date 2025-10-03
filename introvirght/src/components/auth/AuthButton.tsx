import React, { useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import AuthModal from './AuthModal';

const AuthButton: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthContext();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  if (isAuthenticated && user) {
    return (
      <div className="relative">
        {/* User Menu Button */}
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          style={{ color: 'var(--neutral-700)' }}
        >
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
              fontWeight: '500', 
              fontSize: 'var(--text-sm)' 
            }}>
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="hidden sm:block" style={{ fontWeight: '500' }}>
            {user.username}
          </span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showUserMenu && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10"
              onClick={() => setShowUserMenu(false)}
            />
            
            {/* Menu */}
            <div className="absolute right-0 mt-2 w-48 z-20" style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--neutral-200)',
              padding: 'var(--space-2) 0'
            }}>
              <div style={{ 
                padding: 'var(--space-4)', 
                borderBottom: '1px solid var(--neutral-100)' 
              }}>
                <p style={{ 
                  fontWeight: '500', 
                  color: 'var(--primary)',
                  marginBottom: 'var(--space-1)'
                }}>
                  {user.username}
                </p>
                <p style={{ 
                  fontSize: 'var(--text-sm)', 
                  color: 'var(--neutral-500)' 
                }}>
                  {user.email}
                </p>
              </div>
              
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  // Navigate to profile - will implement later
                }}
                className="w-full text-left hover:bg-gray-50 transition-colors"
                style={{ 
                  padding: 'var(--space-2) var(--space-4)', 
                  color: 'var(--neutral-700)' 
                }}
              >
                View Profile
              </button>
              
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  // Navigate to settings - will implement later
                }}
                className="w-full text-left hover:bg-gray-50 transition-colors"
                style={{ 
                  padding: 'var(--space-2) var(--space-4)', 
                  color: 'var(--neutral-700)' 
                }}
              >
                Settings
              </button>
              
              <hr style={{ 
                margin: 'var(--space-2) 0', 
                border: 'none',
                borderTop: '1px solid var(--neutral-100)' 
              }} />
              
              <button
                onClick={handleLogout}
                className="w-full text-left hover:bg-red-50 transition-colors"
                style={{ 
                  padding: 'var(--space-2) var(--space-4)', 
                  color: '#ef4444' 
                }}
              >
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
        <button
          onClick={() => {
            setAuthMode('login');
            setShowAuthModal(true);
          }}
          className="btn-ghost"
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setAuthMode('register');
            setShowAuthModal(true);
          }}
          className="btn-primary"
        >
          Join Now
        </button>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
};

export default AuthButton;