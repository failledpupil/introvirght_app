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
          className="flex items-center space-x-2 text-stone-700 hover:text-sage-600 transition-colors duration-200"
        >
          <div className="w-8 h-8 bg-sage-100 rounded-full flex items-center justify-center">
            <span className="text-sage-700 font-medium text-sm">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="hidden sm:block font-medium">{user.username}</span>
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
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-stone-200 py-2 z-20">
              <div className="px-4 py-2 border-b border-stone-100">
                <p className="font-medium text-stone-800">{user.username}</p>
                <p className="text-sm text-stone-500">{user.email}</p>
              </div>
              
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  // Navigate to profile - will implement later
                }}
                className="w-full text-left px-4 py-2 text-stone-700 hover:bg-stone-50 transition-colors duration-200"
              >
                View Profile
              </button>
              
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  // Navigate to settings - will implement later
                }}
                className="w-full text-left px-4 py-2 text-stone-700 hover:bg-stone-50 transition-colors duration-200"
              >
                Settings
              </button>
              
              <hr className="my-2 border-stone-100" />
              
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
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
      <div className="flex items-center space-x-3">
        <button
          onClick={() => {
            setAuthMode('login');
            setShowAuthModal(true);
          }}
          className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-md"
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setAuthMode('register');
            setShowAuthModal(true);
          }}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
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