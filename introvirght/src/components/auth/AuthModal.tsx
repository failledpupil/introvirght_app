import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Update mode when initialMode changes
  React.useEffect(() => {
    if (isOpen) {
      console.log('🔍 Modal opening with z-index:', 2147483647);
      setMode(initialMode);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Add a temporary red border to help debug visibility
      const modalElement = document.querySelector('.modal-overlay');
      if (modalElement) {
        (modalElement as HTMLElement).style.border = '5px solid red';
        console.log('🔍 Modal element found and styled');
      }
    } else {
      console.log('🔍 Modal closing');
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSuccess = () => {
    // Close modal immediately
    onClose();
  };

  const handleSwitchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  // Create modal content
  const modalContent = (
    <div 
      className="modal-overlay fixed inset-0 overflow-y-auto"
      style={{ 
        zIndex: 2147483647,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        isolation: 'isolate',
        pointerEvents: 'auto',
        backgroundColor: 'rgba(0, 0, 0, 0.1)' // Slight tint to make it visible
      }}
      onClick={(e) => {
        console.log('Modal backdrop clicked');
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1
        }}
        onClick={() => {
          console.log('Inner backdrop clicked');
          onClose();
        }}
      />

      {/* Modal Container */}
      <div 
        className="flex min-h-full items-center justify-center p-4"
        style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          position: 'relative',
          zIndex: 2
        }}
      >
        <div 
          className="relative w-full max-w-md"
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '28rem'
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute z-10"
            style={{
              position: 'absolute',
              top: '-12px',
              right: '-12px',
              zIndex: 10,
              backgroundColor: 'white',
              borderRadius: '50%',
              padding: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb',
              cursor: 'pointer'
            }}
            aria-label="Close modal"
          >
            <svg 
              style={{ width: '20px', height: '20px', color: '#6b7280' }} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Form Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {mode === 'login' ? (
              <LoginForm
                onSuccess={handleSuccess}
                onSwitchToRegister={handleSwitchMode}
              />
            ) : (
              <RegisterForm
                onSuccess={handleSuccess}
                onSwitchToLogin={handleSwitchMode}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render modal using portal to document.body
  return createPortal(modalContent, document.body);
};

export default AuthModal;