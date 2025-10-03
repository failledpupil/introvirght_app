import React, { useState, useEffect, useRef } from 'react';
import { ChatService, type ChatMessage } from '../../services';

interface AICompanionProps {
  onClose: () => void;
}

interface PersonalInsight {
  type: 'pattern' | 'mood' | 'growth' | 'theme';
  title: string;
  description: string;
  confidence: number;
  relatedEntries?: string[];
}

const AICompanion: React.FC<AICompanionProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [insights, setInsights] = useState<PersonalInsight[]>([]);
  const [showInsights, setShowInsights] = useState(false);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history and insights on component mount
  useEffect(() => {
    loadChatHistory();
    loadPersonalInsights();
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const loadChatHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await ChatService.getChatHistory();
      if (response.success && response.data) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadPersonalInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const response = await ChatService.getPersonalInsights();
      if (response.success && response.data) {
        setInsights(response.data.insights || []);
      }
    } catch (error) {
      console.error('Failed to load personal insights:', error);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await ChatService.sendMessage(userMessage);
      if (response.success && response.data) {
        // Add both user and assistant messages to the conversation
        const userMsg: ChatMessage = {
          id: `temp_user_${Date.now()}`,
          userId: 'current_user',
          role: 'user',
          content: userMessage,
          timestamp: new Date(),
        };

        const aiResponse = response.data?.message || {
          id: `error_${Date.now()}`,
          userId: 'ai',
          role: 'assistant' as const,
          content: 'Error: No response received',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg, aiResponse]);
      } else {
        // Show error message
        const errorMsg: ChatMessage = {
          id: `error_${Date.now()}`,
          userId: 'system',
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your message. Please try again.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMsg: ChatMessage = {
        id: `error_${Date.now()}`,
        userId: 'system',
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear your conversation history? This cannot be undone.')) {
      try {
        const response = await ChatService.clearChatHistory();
        if (response.success) {
          setMessages([]);
        }
      } catch (error) {
        console.error('Failed to clear chat history:', error);
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { [key: string]: ChatMessage[] } = {};
    
    messages.forEach(message => {
      const dateKey = message.timestamp.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return Object.entries(groups).map(([dateKey, msgs]) => ({
      date: new Date(dateKey),
      messages: msgs,
    }));
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl h-[80vh] bg-white rounded-xl shadow-xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-stone-100 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-sage-400 to-sage-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-serif font-semibold text-stone-800">
                    AI Companion
                  </h2>
                  <p className="text-sm text-stone-500">
                    Your personal reflection partner
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowInsights(!showInsights)}
                  className={`text-stone-400 hover:text-stone-600 transition-colors p-2 rounded-lg hover:bg-stone-100 ${showInsights ? 'bg-sage-100 text-sage-600' : ''}`}
                  title="Personal insights"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </button>
                {messages.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-stone-400 hover:text-stone-600 transition-colors p-2 rounded-lg hover:bg-stone-100"
                    title="Clear conversation"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-stone-400 hover:text-stone-600 transition-colors p-2 rounded-lg hover:bg-stone-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Personal Insights Panel */}
          {showInsights && (
            <div className="border-b border-stone-100 bg-sage-50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-serif font-semibold text-stone-800">
                  Personal Insights
                </h3>
                <button
                  onClick={loadPersonalInsights}
                  className="text-sage-600 hover:text-sage-700 transition-colors p-1 rounded"
                  title="Refresh insights"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              
              {isLoadingInsights ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sage-600"></div>
                </div>
              ) : insights.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-sage-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <p className="text-stone-600 text-sm">
                    Write more diary entries to unlock personalized insights about your patterns and growth.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.map((insight, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-4 border border-sage-200 hover:border-sage-300 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          insight.type === 'pattern' ? 'bg-blue-100 text-blue-600' :
                          insight.type === 'mood' ? 'bg-yellow-100 text-yellow-600' :
                          insight.type === 'growth' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {insight.type === 'pattern' && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          )}
                          {insight.type === 'mood' && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {insight.type === 'growth' && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          )}
                          {insight.type === 'theme' && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-stone-800 text-sm mb-1">
                            {insight.title}
                          </h4>
                          <p className="text-stone-600 text-xs leading-relaxed">
                            {insight.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-sage-400 rounded-full"></div>
                              <span className="text-xs text-stone-500">
                                {Math.round(insight.confidence * 100)}% confidence
                              </span>
                            </div>
                            {insight.relatedEntries && insight.relatedEntries.length > 0 && (
                              <span className="text-xs text-stone-500">
                                {insight.relatedEntries.length} entries
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-serif font-semibold text-stone-700 mb-2">
                  Start a Conversation
                </h3>
                <p className="text-stone-600 max-w-md mx-auto mb-6">
                  I'm here to help you reflect on your thoughts and experiences. 
                  I've read your diary entries and I'm ready to support your journey of self-discovery.
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-stone-700">Try asking me:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      "How am I feeling lately?",
                      "What patterns do you notice in my writing?",
                      "Help me reflect on my growth",
                      "What themes appear in my diary?",
                      "What insights do you have about me?",
                      "How has my mood changed over time?"
                    ].map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setInputMessage(suggestion)}
                        className="text-xs bg-sage-50 text-sage-700 px-3 py-1 rounded-full hover:bg-sage-100 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messageGroups.map(({ date, messages: dayMessages }) => (
                <div key={date.toDateString()}>
                  <div className="text-center mb-4">
                    <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-sm">
                      {formatDate(date)}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {dayMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            message.role === 'user'
                              ? 'bg-sage-600 text-white'
                              : 'bg-stone-100 text-stone-800'
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <p
                            className={`text-xs mt-2 ${
                              message.role === 'user' ? 'text-sage-200' : 'text-stone-500'
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-stone-100 rounded-2xl px-4 py-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-stone-500">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t border-stone-100 flex-shrink-0">
            <form onSubmit={handleSendMessage} className="flex space-x-3">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Share your thoughts or ask me anything..."
                className="flex-1 input-gentle"
                disabled={isLoading}
                maxLength={1000}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
                <span>Send</span>
              </button>
            </form>
            <p className="text-xs text-stone-500 mt-2">
              Your conversations are private and used only to provide personalized responses based on your diary entries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICompanion;