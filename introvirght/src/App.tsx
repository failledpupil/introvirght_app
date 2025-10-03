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
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-500 mx-auto"></div>
            <p className="text-stone-600">Loading your mindful space...</p>
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
        <div className="space-y-8">
          {/* Welcome Back Section */}
          <div className="text-center space-y-6">
            <h2 className="text-4xl font-serif font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome back, {user.username}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-lg">
              Your vibrant mindful space awaits. Share your thoughts, connect with others, 
              and continue your colorful journey of authentic self-expression.
            </p>
          </div>

          {/* Compose Box */}
          <ComposeBox className="max-w-2xl mx-auto" />

          {/* User Stats */}
          <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
            <div className="card-gentle text-center bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 hover:shadow-xl transition-all duration-300 interactive-card">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{user.postCount || 0}</div>
              <div className="text-blue-700 text-sm font-semibold">Posts</div>
            </div>
            <div className="card-gentle text-center bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200 hover:shadow-xl transition-all duration-300 interactive-card">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{user.followerCount || 0}</div>
              <div className="text-purple-700 text-sm font-semibold">Followers</div>
            </div>
            <div className="card-gentle text-center bg-gradient-to-br from-emerald-50 to-teal-100 border-2 border-emerald-200 hover:shadow-xl transition-all duration-300 interactive-card">
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{user.followingCount || 0}</div>
              <div className="text-emerald-700 text-sm font-semibold">Following</div>
            </div>
          </div>

          {/* Feed */}
          <div className="max-w-2xl mx-auto">
            <PostFeed feedType="feed" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-serif font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome to Your Mindful Space
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-lg">
            Introvirght is a vibrant, text-focused social platform designed for meaningful 
            connections and authentic self-expression. Share your thoughts, reflect on 
            your journey, and connect with others in a beautiful digital environment.
          </p>
        </div>

        {/* Inspiration Card */}
        <div className="card-gentle max-w-2xl mx-auto text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-inspirational text-lg">
              "{inspirationPrompt}"
            </p>
            <p className="text-stone-500 text-sm">
              Your journey of authentic expression begins here.
            </p>
          </div>
        </div>

        {/* Feature Preview */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="card-gentle text-center">
            <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h3 className="font-semibold text-stone-800 mb-2">Thoughtful Writing</h3>
            <p className="text-stone-600 text-sm">
              Express yourself through mindful, text-only posts in a distraction-free environment.
            </p>
          </div>

          <div className="card-gentle text-center">
            <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-stone-800 mb-2">Meaningful Connections</h3>
            <p className="text-stone-600 text-sm">
              Follow others and build genuine relationships through authentic conversations.
            </p>
          </div>

          <div className="card-gentle text-center">
            <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-stone-800 mb-2">Peaceful Environment</h3>
            <p className="text-stone-600 text-sm">
              Experience social media designed for calm, with gentle interactions and soothing aesthetics.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-4 mt-12 mb-12">
          <p className="text-stone-600">
            Ready to begin your journey of mindful connection?
          </p>
          <div className="space-x-4">
            <button className="btn-primary">
              Get Started
            </button>
            <button className="btn-secondary">
              Learn More
            </button>
          </div>
        </div>

        {/* Recent Posts for Non-Authenticated Users */}
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-serif font-semibold text-sage-700 text-center">
              Recent Mindful Shares
            </h2>
            <p className="text-stone-600 text-center text-sm mt-2">
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
