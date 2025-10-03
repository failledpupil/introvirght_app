import React from 'react';
import { AuthButton } from './auth';
import SearchBar from './SearchBar';
import { useAuthContext } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuthContext();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <a href="#" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <h1 style={{ 
                  fontSize: 'var(--text-2xl)', 
                  fontWeight: '700', 
                  color: 'var(--primary)',
                  margin: 0 
                }}>
                  Introvirght
                </h1>
                <span style={{ 
                  fontSize: 'var(--text-sm)', 
                  color: 'var(--neutral-500)',
                  fontStyle: 'italic'
                }}>
                  Step towards yourself
                </span>
              </a>
            </div>
            
            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              {isAuthenticated && (
                <>
                  <a
                    href="#diary"
                    className="btn-ghost flex items-center space-x-2"
                    style={{ padding: 'var(--space-2) var(--space-3)' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>Diary</span>
                  </a>
                  <a
                    href="#engagement"
                    className="btn-ghost flex items-center space-x-2"
                    style={{ padding: 'var(--space-2) var(--space-3)' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Journey</span>
                  </a>
                  <div className="hidden lg:block" style={{ width: '200px' }}>
                    <SearchBar />
                  </div>
                </>
              )}
              <div className="flex-shrink-0">
                <AuthButton />
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ 
        backgroundColor: 'var(--bg-primary)', 
        borderTop: '1px solid var(--neutral-200)', 
        marginTop: 'var(--space-16)' 
      }}>
        <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
          <div className="text-center" style={{ color: 'var(--neutral-500)', fontSize: 'var(--text-sm)' }}>
            <p style={{ fontStyle: 'italic', marginBottom: 'var(--space-2)' }}>
              "The journey inward is the most important journey of all."
            </p>
            <p>
              © 2024 Introvirght. A space for mindful connection.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;