import React, { useState, useRef, useEffect } from 'react';
import { 
  Send,
  Phone,
  Video,
  MoreVertical,
  Search,
  Plus,
  Users,
  MessageCircle,
  Paperclip,
  Smile,
  Hash
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollToElement } from '../../utils/scrollHelper';
import { chatService } from '../../services/chatService';

export const Chat: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Fetch conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const conversationsData = await chatService.getConversations();
        setConversations(conversationsData);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConversations();
  }, []);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        try {
          setIsLoading(true);
          const messagesData = await chatService.getMessages(selectedConversation);
          setMessages(messagesData);
          
          // Mark messages as read
          await chatService.markMessagesAsRead(selectedConversation);
          
          // Update unread counts in conversation list
          setConversations(conversations.map(conv => 
            conv.id === selectedConversation ? { ...conv, unread_count: 0 } : conv
          ));
        } catch (error) {
          console.error('Error fetching messages:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchMessages();
    }
  }, [selectedConversation]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      setTimeout(scrollToBottom, 100);
    }
  }, [selectedConversation]);

  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation) return;
    
    // Get the conversation
    const conversation = conversations.find(conv => conv.id === selectedConversation);
    if (!conversation) return;
    
    try {
      // Send message to receiver
      await chatService.sendMessage(
        selectedConversation,
        conversation.other_participant_id,
        message
      );
      
      // Add message to UI immediately
      const newMessage = {
        id: Date.now().toString(),
        conversation_id: selectedConversation,
        sender_id: user?.id,
        receiver_id: conversation.other_participant_id,
        content: message,
        timestamp: new Date(),
        is_read: false,
        isOwn: true
      };
      
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Scroll to bottom to show new message
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Heute';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Gestern';
    } else {
      return date.toLocaleDateString('de-DE');
    }
  };

  // Filter conversations by search query
  const filteredConversations = conversations.filter(conv => 
    conv.other_participant_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto h-screen flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-namuh-navy">Nachrichten</h1>
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Unterhaltungen durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-namuh-teal focus:border-transparent"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-namuh-teal"></div>
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                    selectedConversation === conversation.id 
                      ? 'bg-namuh-teal/5 border-l-4 border-l-namuh-teal' 
                      : 'hover:bg-gray-50'
                  }`}
                  id={`conversation-${conversation.id}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      {conversation.job_id ? (
                        <div className="w-10 h-10 bg-namuh-teal rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {conversation.other_participant_name.charAt(0)}
                          </span>
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-namuh-teal/20 rounded-full flex items-center justify-center">
                          <Hash className="h-5 w-5 text-namuh-teal" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {conversation.other_participant_name}
                        </h3>
                        {conversation.job_title && (
                          <p className="text-xs text-namuh-teal">
                            Bezieht sich auf: {conversation.job_title}
                          </p>
                        )}
                      </div>
                    </div>
                    {conversation.unread_count > 0 && (
                      <span className="bg-namuh-teal text-white text-xs font-medium px-2 py-1 rounded-full">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.last_message || 'Keine Nachrichten'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {conversation.last_message_timestamp ? 
                      formatTime(new Date(conversation.last_message_timestamp)) : 
                      'Keine Aktivität'}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>Keine Unterhaltungen gefunden</p>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="mt-2 text-namuh-teal text-sm"
                  >
                    Suche zurücksetzen
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-namuh-teal"></div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-namuh-teal rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {conversations.find(c => c.id === selectedConversation)?.other_participant_name.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-900">
                          {conversations.find(c => c.id === selectedConversation)?.other_participant_name || 'Chat'}
                        </h2>
                        {conversations.find(c => c.id === selectedConversation)?.job_title && (
                          <p className="text-sm text-namuh-teal">
                            Bewerbung: {conversations.find(c => c.id === selectedConversation)?.job_title}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-600 hover:text-namuh-teal hover:bg-gray-100 rounded-lg">
                        <Phone className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-namuh-teal hover:bg-gray-100 rounded-lg">
                        <Video className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-namuh-teal hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div 
                  ref={messagesContainerRef} 
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                  {messages.length > 0 ? messages.map((msg, index) => {
                    const showDate = index === 0 || 
                      formatDate(new Date(msg.timestamp)) !== formatDate(new Date(messages[index - 1].timestamp));
                    
                    const isOwn = msg.sender_id === user?.id;
                    
                    return (
                      <div key={msg.id} id={`message-${msg.id}`}>
                        {showDate && (
                          <div className="flex justify-center">
                            <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                              {formatDate(new Date(msg.timestamp))}
                            </span>
                          </div>
                        )}
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md ${
                            isOwn ? 'order-2' : 'order-1'
                          }`}>
                            {!isOwn && (
                              <p className="text-xs text-gray-500 mb-1 px-3">
                                {conversations.find(c => c.id === selectedConversation)?.other_participant_name || 'Unknown'}
                              </p>
                            )}
                            <div className={`px-4 py-2 rounded-lg ${
                              isOwn 
                                ? 'bg-namuh-teal text-white rounded-br-sm' 
                                : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                            }`}>
                              <p className="text-sm">{msg.content}</p>
                              <p className={`text-xs mt-1 ${
                                isOwn ? 'text-namuh-teal-light' : 'text-gray-500'
                              }`}>
                                {formatTime(new Date(msg.timestamp))}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    );
                  }) : (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Noch keine Nachrichten</p>
                      <p className="text-sm text-gray-400">Senden Sie eine Nachricht, um die Unterhaltung zu beginnen</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="bg-white border-t border-gray-200 p-4">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <button 
                      type="button"
                      className="p-2 text-gray-600 hover:text-namuh-teal hover:bg-gray-100 rounded-lg"
                    >
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Nachricht eingeben..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-namuh-teal focus:border-transparent pr-10"
                      />
                      <button 
                        type="button"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 hover:text-namuh-teal"
                      >
                        <Smile className="h-5 w-5" />
                      </button>
                    </div>
                    <button 
                      type="submit"
                      disabled={!message.trim()}
                      className="p-2 bg-namuh-teal text-white rounded-lg hover:bg-namuh-teal-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              </>
            )
          ) : (
            /* No conversation selected */
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Wählen Sie eine Unterhaltung
                </h3>
                <p className="text-gray-600">
                  Wählen Sie aus der Liste links eine Unterhaltung aus, um zu beginnen.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};