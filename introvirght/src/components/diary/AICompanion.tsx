import React, { useState, useEffect, useRef } from 'react';
import { ChatService, type ChatMessage } from '../../services';

interface AICompanionProps {
  onClose: () => void;
}

const AICompanion: React.FC<AICompanionProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history on component mount
  useEffect(() => {
    loadChatHistory();
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
                      "What patterns do you notice?",
                      "Help me reflect on my goals",
                      "What am I grateful for?"
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