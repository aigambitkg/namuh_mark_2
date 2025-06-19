import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCw, Zap, Sparkles, Info } from 'lucide-react';
import { useGeminiAI } from '../hooks/useGeminiAI';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export const GeminiAIChat: React.FC = () => {
  const { user } = useAuthStore();
  const { generateResponse, isLoading, error, hasEnoughTokens } = useGeminiAI();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Initialize with a welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          content: `Hallo ${user?.name || 'dort'}! Ich bin der namuH-KI-Assistent, basierend auf Gemini. Wie kann ich dir heute bei deiner Karriere oder Stellensuche helfen?`,
          isUser: false,
          timestamp: new Date()
        }
      ]);
    }
  }, [messages.length, user?.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const userPrompt = input;
    setInput('');
    
    try {
      // Call Gemini API via Edge Function
      const response = await generateResponse(userPrompt);
      
      // Add AI response
      if (response) {
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          content: response.text || 'Es tut mir leid, ich konnte keine Antwort generieren. Bitte versuche es erneut.',
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error getting Gemini response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: error instanceof Error 
          ? error.message
          : 'Es ist ein Fehler aufgetreten. Bitte versuche es später erneut oder kontaktiere den Support.',
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-namuh-navy flex items-center">
            <Sparkles className="h-8 w-8 mr-3 text-namuh-teal" />
            Gemini KI-Chat
          </h1>
          <p className="mt-2 text-gray-600">
            Stelle eine Frage zu Karriere, Bewerbung oder Jobsuche
          </p>
        </div>
        
        {/* Token Information */}
        <div className="mb-4 flex items-center">
          <div className="mr-3 flex items-center bg-namuh-teal/10 text-namuh-teal px-3 py-1 rounded-full text-sm">
            <Zap className="h-4 w-4 mr-2" />
            <span className="font-medium">{user?.tokenBalance || 0} Tokens verfügbar</span>
          </div>
          <p className="text-sm text-gray-600">Jede Anfrage verbraucht 1 Token</p>
        </div>
        
        {/* Chat Container */}
        <div className="card p-6 mb-8">
          <div className="h-[600px] overflow-y-auto mb-4 p-4 space-y-6 border border-gray-200 rounded-lg">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] rounded-lg p-4 ${
                    message.isUser 
                      ? 'bg-namuh-teal text-white rounded-br-none' 
                      : 'bg-white border border-gray-200 rounded-bl-none'
                  }`}>
                    <div className="flex items-center mb-2">
                      {!message.isUser && <Bot className="h-5 w-5 mr-2 text-namuh-teal" />}
                      <span className={`font-medium ${message.isUser ? '' : 'text-namuh-navy'}`}>
                        {message.isUser ? 'Du' : 'Gemini AI'}
                      </span>
                      {message.isUser && <User className="h-5 w-5 ml-2 text-white" />}
                    </div>
                    
                    <div className={`whitespace-pre-wrap ${message.isUser ? 'text-white' : 'text-gray-800'}`}>
                      {message.content}
                    </div>
                    
                    <div className={`text-xs mt-2 ${message.isUser ? 'text-white/70' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white border border-gray-200 rounded-lg p-4 rounded-bl-none max-w-[75%]">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-namuh-teal" />
                    <RefreshCw className="h-4 w-4 animate-spin text-namuh-teal" />
                    <span className="text-gray-600">Gemini AI denkt nach...</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Stelle eine Frage..."
              className="flex-1 input-field"
              disabled={isLoading || !hasEnoughTokens}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || !hasEnoughTokens}
              className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 flex items-center">
                <Info className="h-4 w-4 mr-2 text-red-500" />
                {error}
              </p>
            </div>
          )}
          
          {!hasEnoughTokens && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700 flex items-center">
                <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                Du hast keine Tokens mehr übrig. Upgrade dein Abo oder kaufe mehr Tokens, um den KI-Chat weiterhin zu nutzen.
              </p>
            </div>
          )}
        </div>
        
        {/* Usage Guidelines */}
        <div className="card p-6 bg-gradient-to-r from-namuh-teal/5 to-namuh-navy/5">
          <h3 className="text-lg font-semibold text-namuh-navy mb-4">Tipps für optimale KI-Antworten</h3>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-7 h-7 bg-namuh-teal text-white rounded-full flex items-center justify-center font-medium mr-3 mt-0.5 flex-shrink-0">1</div>
              <div>
                <p className="font-medium text-gray-900">Stelle spezifische Fragen</p>
                <p className="text-sm text-gray-600">Je präziser deine Frage, desto nützlicher die Antwort.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-7 h-7 bg-namuh-teal text-white rounded-full flex items-center justify-center font-medium mr-3 mt-0.5 flex-shrink-0">2</div>
              <div>
                <p className="font-medium text-gray-900">Gib Kontext an</p>
                <p className="text-sm text-gray-600">Erwähne relevante Details wie Branche, Erfahrungslevel oder spezifische Anforderungen.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-7 h-7 bg-namuh-teal text-white rounded-full flex items-center justify-center font-medium mr-3 mt-0.5 flex-shrink-0">3</div>
              <div>
                <p className="font-medium text-gray-900">Frag nach konkreten Beispielen</p>
                <p className="text-sm text-gray-600">Bitte um praktische Beispiele oder Formulierungshilfen für bessere Anwendbarkeit.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};