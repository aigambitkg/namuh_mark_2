import { useState } from 'react';
import { geminiService, Message } from '../services/geminiService';
import { useAuthStore } from '../store/authStore';

export const useGeminiAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useAuthStore();

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      // Add user message to the chat
      const userMessage: Message = { role: 'user', content };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      // Send to Gemini API
      const response = await geminiService.createChatCompletion({
        messages: updatedMessages
      });

      // Add AI response to the chat
      const aiMessage: Message = { role: 'model', content: response };
      setMessages([...updatedMessages, aiMessage]);

    } catch (err) {
      console.error('Error sending message to Gemini:', err);
      setError(err instanceof Error ? err.message : 'Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const hasTokens = user?.tokenBalance && user?.tokenBalance > 0;

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    hasTokens,
    tokenBalance: user?.tokenBalance || 0
  };
};