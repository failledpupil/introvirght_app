import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-sage-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-sage-700 mb-2">
            Introvirght
          </h1>
          <p className="text-lg text-stone-600 font-serif italic mb-8">
            Step towards yourself
          </p>
          
          <div className="card max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-stone-800 mb-4">
              Welcome to your mindful space
            </h2>
            <p className="text-stone-600 mb-6">
              A calm platform for authentic self-expression through thoughtful written content.
            </p>
            <button className="btn-primary w-full">
              Begin your journey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;