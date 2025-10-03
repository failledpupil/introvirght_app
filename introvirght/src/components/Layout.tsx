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
      <header className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-b-2 border-blue-200 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <a href="#" className="flex items-center space-x-3 hover:opacity-80 transition-all duration-300 hover:scale-105">
                <h1 className="text-3xl font-serif font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Introvirght
                </h1>
                <span className="text-sm text-gray-600 font-serif italic bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Step towards yourself
                </span>
              </a>
            </div>
            
            {/* Navigation */}
            <nav className="flex items-center space-x-3">
              {isAuthenticated && (
                <>
                  <a
                    href="#diary"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-1 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>Diary</span>
                  </a>
                  <a
                    href="#engagement"
                    className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-1 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Journey</span>
                  </a>
                  <div className="hidden lg:block w-48">
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
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-stone-500 text-sm">
            <p className="font-serif italic">
              "The journey inward is the most important journey of all."
            </p>
            <p className="mt-2">
              © 2024 Introvirght. A space for mindful connection.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;