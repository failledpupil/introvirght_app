import Layout from './components/Layout';
import { getInspirationPrompt } from './utils';
import { useAuthContext } from './contexts/AuthContext';
import { ComposeBox, PostFeed } from './components/posts';
import CompleteDiaryPage from './pages/CompleteDiaryPage';
import EngagementPage from './pages/EngagementPage';
import { useState, useEffect } from 'react';

function App() {
  const { isAuthenticated, user, isLoading } = useAuthContext();
  const inspirationPrompt = getInspirationPrompt();
  const [currentPage, setCurrentPage] = useState('home');

  // Simple routing based on URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      setCurrentPage(hash || 'home');
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Set initial page

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-16)' }}>
          <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="loading-spinner mx-auto"></div>
            <p style={{ color: 'var(--neutral-600)' }}>Loading your mindful space...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Route to diary page
  if (currentPage === 'diary') {
    return <CompleteDiaryPage />;
  }

  // Route to engagement page
  if (currentPage === 'engagement') {
    return <EngagementPage />;
  }

  if (isAuthenticated && user) {
    return (
      <Layout>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {/* Welcome Back Section */}
          <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <h2 style={{ 
              fontSize: 'var(--text-4xl)', 
              fontWeight: '700', 
              color: 'var(--primary)',
              margin: 0
            }}>
              Welcome back, {user.username}
            </h2>
            <p className="content-container" style={{ 
              color: 'var(--neutral-600)', 
              fontSize: 'var(--text-lg)',
              lineHeight: '1.6',
              margin: '0 auto'
            }}>
              Your mindful space awaits. Share your thoughts, connect with others, 
              and continue your journey of authentic self-expression.
            </p>
          </div>

          {/* Compose Box */}
          <div className="content-container">
            <ComposeBox />
          </div>

          {/* User Stats */}
          <div className="content-container">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card text-center">
                <div style={{ 
                  fontSize: 'var(--text-3xl)', 
                  fontWeight: '700', 
                  color: 'var(--primary)',
                  marginBottom: 'var(--space-1)'
                }}>
                  {user.postCount || 0}
                </div>
                <div style={{ 
                  color: 'var(--neutral-600)', 
                  fontSize: 'var(--text-sm)', 
                  fontWeight: '500' 
                }}>
                  Posts
                </div>
              </div>
              <div className="card text-center">
                <div style={{ 
                  fontSize: 'var(--text-3xl)', 
                  fontWeight: '700', 
                  color: 'var(--primary)',
                  marginBottom: 'var(--space-1)'
                }}>
                  {user.followerCount || 0}
                </div>
                <div style={{ 
                  color: 'var(--neutral-600)', 
                  fontSize: 'var(--text-sm)', 
                  fontWeight: '500' 
                }}>
                  Followers
                </div>
              </div>
              <div className="card text-center">
                <div style={{ 
                  fontSize: 'var(--text-3xl)', 
                  fontWeight: '700', 
                  color: 'var(--primary)',
                  marginBottom: 'var(--space-1)'
                }}>
                  {user.followingCount || 0}
                </div>
                <div style={{ 
                  color: 'var(--neutral-600)', 
                  fontSize: 'var(--text-sm)', 
                  fontWeight: '500' 
                }}>
                  Following
                </div>
              </div>
            </div>
          </div>

          {/* Feed */}
          <div className="content-container">
            <PostFeed feedType="feed" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        {/* Hero Section */}
        <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <h1 style={{ 
            fontSize: 'var(--text-5xl)', 
            fontWeight: '700', 
            color: 'var(--primary)',
            margin: 0,
            lineHeight: '1.1'
          }}>
            Welcome to Your Mindful Space
          </h1>
          <p className="content-container" style={{ 
            color: 'var(--neutral-600)', 
            fontSize: 'var(--text-lg)',
            lineHeight: '1.6',
            margin: '0 auto'
          }}>
            Introvirght is a clean, text-focused social platform designed for meaningful 
            connections and authentic self-expression. Share your thoughts, reflect on 
            your journey, and connect with others in a thoughtful digital environment.
          </p>
        </div>

        {/* Inspiration Card */}
        <div className="content-container">
          <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p style={{ 
              fontSize: 'var(--text-lg)', 
              color: 'var(--neutral-600)',
              fontStyle: 'italic'
            }}>
              "{inspirationPrompt}"
            </p>
            <p style={{ 
              color: 'var(--neutral-500)', 
              fontSize: 'var(--text-sm)' 
            }}>
              Your journey of authentic expression begins here.
            </p>
          </div>
        </div>

        {/* Feature Preview */}
        <div style={{ marginTop: 'var(--space-12)' }}>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: 'var(--neutral-100)', 
                borderRadius: 'var(--radius-lg)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto var(--space-4) auto' 
              }}>
                <svg style={{ width: '24px', height: '24px', color: 'var(--secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 style={{ 
                fontWeight: '600', 
                color: 'var(--primary)', 
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--text-lg)'
              }}>
                Thoughtful Writing
              </h3>
              <p style={{ 
                color: 'var(--neutral-600)', 
                fontSize: 'var(--text-sm)',
                lineHeight: '1.5'
              }}>
                Express yourself through mindful, text-only posts in a distraction-free environment.
              </p>
            </div>

            <div className="card text-center">
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: 'var(--neutral-100)', 
                borderRadius: 'var(--radius-lg)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto var(--space-4) auto' 
              }}>
                <svg style={{ width: '24px', height: '24px', color: 'var(--secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 style={{ 
                fontWeight: '600', 
                color: 'var(--primary)', 
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--text-lg)'
              }}>
                Meaningful Connections
              </h3>
              <p style={{ 
                color: 'var(--neutral-600)', 
                fontSize: 'var(--text-sm)',
                lineHeight: '1.5'
              }}>
                Follow others and build genuine relationships through authentic conversations.
              </p>
            </div>

            <div className="card text-center">
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: 'var(--neutral-100)', 
                borderRadius: 'var(--radius-lg)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto var(--space-4) auto' 
              }}>
                <svg style={{ width: '24px', height: '24px', color: 'var(--secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 style={{ 
                fontWeight: '600', 
                color: 'var(--primary)', 
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--text-lg)'
              }}>
                Clean Environment
              </h3>
              <p style={{ 
                color: 'var(--neutral-600)', 
                fontSize: 'var(--text-sm)',
                lineHeight: '1.5'
              }}>
                Experience social media designed for focus, with clean interactions and professional aesthetics.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 'var(--space-4)', 
          marginTop: 'var(--space-12)', 
          marginBottom: 'var(--space-12)' 
        }}>
          <p style={{ color: 'var(--neutral-600)' }}>
            Ready to begin your journey of mindful connection?
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
            <button className="btn-primary">
              Get Started
            </button>
            <button className="btn-secondary">
              Learn More
            </button>
          </div>
        </div>

        {/* Recent Posts for Non-Authenticated Users */}
        <div className="content-container">
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h2 className="text-center" style={{ 
              fontSize: 'var(--text-xl)', 
              fontWeight: '600', 
              color: 'var(--primary)',
              marginBottom: 'var(--space-2)'
            }}>
              Recent Mindful Shares
            </h2>
            <p className="text-center" style={{ 
              color: 'var(--neutral-600)', 
              fontSize: 'var(--text-sm)' 
            }}>
              Discover thoughtful posts from our community
            </p>
          </div>
          <PostFeed feedType="recent" />
        </div>
      </div>
    </Layout>
  );
}

export default App;
