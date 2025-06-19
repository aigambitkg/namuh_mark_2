import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  AlertCircle, 
  Loader, 
  Zap,
  RefreshCw,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGeminiAI } from '../../hooks/useGeminiAI';

export const GeminiAIChat: React.FC = () => {
  const [message, setMessage] = useState('');
  const { messages, isLoading, error, sendMessage, clearChat, hasTokens, tokenBalance } = useGeminiAI();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && hasTokens) {
      sendMessage(message);
      setMessage('');
    }
  };

  // Format message content with markdown-like syntax
  const formatMessage = (content: string) => {
    return content.split('\n').map((line, i) => (
      <p key={i} className={`mb-2 ${line.startsWith('*') ? 'font-semibold' : ''}`}>
        {line}
      </p>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-namuh-navy flex items-center">
            <Bot className="mr-3 h-8 w-8 text-namuh-teal" />
            Gemini AI Chat
          </h1>
          <p className="mt-2 text-gray-600">
            Stellen Sie Fragen zu Ihrer Karriere, Bewerbung oder bekommen Sie Hilfe bei Ihrem Lebenslauf
          </p>
        </div>

        {/* Token Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-namuh-teal mr-2" />
              <span className="font-medium text-gray-700">Token-Status:</span>
              <span className={`ml-2 ${hasTokens ? 'text-green-600' : 'text-red-600'}`}>
                {tokenBalance} {tokenBalance === 1 ? 'Token' : 'Tokens'} verfügbar
              </span>
            </div>
            {messages.length > 0 && (
              <button 
                onClick={clearChat}
                className="text-gray-500 hover:text-red-600 transition-colors flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                <span className="text-sm">Chat löschen</span>
              </button>
            )}
          </div>

          {!hasTokens && (
            <div className="mt-3 bg-red-50 text-red-700 p-3 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Keine Tokens verfügbar</p>
                <p className="text-sm">Sie benötigen Tokens, um mit Gemini AI zu chatten. Aktualisieren Sie Ihr Abonnement oder erwerben Sie zusätzliche Tokens.</p>
                <button className="mt-2 bg-red-600 text-white py-1 px-3 rounded-md text-sm hover:bg-red-700 transition-colors">
                  Tokens kaufen
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Bot className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Wie kann ich Ihnen heute helfen?</h3>
                <p className="text-gray-500 max-w-md">
                  Stellen Sie mir Fragen zu Bewerbungen, Lebenslauf-Optimierung, Karrieretipps oder Interviewvorbereitung.
                </p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-left w-full max-w-xl">
                  {[
                    "Wie verbessere ich meinen Lebenslauf?", 
                    "Gib mir Tipps für ein erfolgreiches Vorstellungsgespräch",
                    "Wie bereite ich mich auf Gehaltsverhandlungen vor?",
                    "Wie erkenne ich eine gute Unternehmenskultur?"
                  ].map((suggestion, index) => (
                    <button 
                      key={index}
                      onClick={() => {
                        if (hasTokens) {
                          sendMessage(suggestion);
                        }
                      }}
                      disabled={!hasTokens}
                      className={`p-3 border rounded-lg text-left hover:bg-gray-50 transition-colors ${
                        hasTokens ? 'border-namuh-teal/30 text-namuh-teal' : 'border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <div 
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'user' ? 'bg-namuh-teal ml-3' : 'bg-namuh-navy mr-3'
                      } text-white`}>
                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`p-4 rounded-lg ${
                        msg.role === 'user' 
                          ? 'bg-namuh-teal text-white rounded-tr-none' 
                          : 'bg-gray-100 text-gray-800 rounded-tl-none'
                      }`}>
                        {formatMessage(msg.content)}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex max-w-[80%]">
                      <div className="rounded-full w-8 h-8 bg-namuh-navy flex items-center justify-center mr-3 text-white">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="p-4 rounded-lg bg-gray-100 text-gray-800 rounded-tl-none">
                        <div className="flex items-center space-x-2">
                          <Loader className="h-4 w-4 animate-spin" />
                          <span>Gemini denkt nach...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="flex justify-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{error}</span>
                      <button 
                        onClick={() => clearChat()}
                        className="ml-3 bg-red-100 hover:bg-red-200 p-1 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="flex space-x-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={hasTokens ? "Ihre Nachricht..." : "Keine Tokens verfügbar"}
                disabled={isLoading || !hasTokens}
                className="flex-1 input-field disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!message.trim() || isLoading || !hasTokens}
                className={`btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
                  isLoading ? 'bg-namuh-navy' : ''
                }`}
              >
                {isLoading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </form>
            <p className="mt-3 text-xs text-gray-500 text-center">
              {hasTokens 
                ? 'Jede Anfrage an Gemini AI verbraucht 1 Token aus Ihrem Guthaben.' 
                : 'Sie benötigen Tokens, um mit Gemini AI zu chatten. Aktualisieren Sie Ihr Abonnement oder erwerben Sie zusätzliche Tokens.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiAIChat;