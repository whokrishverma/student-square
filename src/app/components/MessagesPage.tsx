import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, Phone, Video, Info, Send, Smile, Image as ImageIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    isOnline: boolean;
  };
  messages: Message[];
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

interface MessagesPageProps {
  conversations: Conversation[];
  currentUserId: string;
  onBack: () => void;
  onSendMessage: (conversationId: string, message: string) => void;
  onVideoCall?: (username: string) => void;
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export function MessagesPage({ conversations, currentUserId, onBack, onSendMessage, onVideoCall, selectedConversationId, onSelectConversation }: MessagesPageProps) {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentConversation = conversations.find((c) => c.id === selectedConversationId) || (conversations.length > 0 ? conversations[0] : null);
  const effectiveSelectedId = currentConversation?.id || null;

  const handleSend = () => {
    if (messageText.trim() && effectiveSelectedId) {
      onSendMessage(effectiveSelectedId, messageText);
      setMessageText('');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="fixed inset-0 bg-stone-50 z-50 flex items-center justify-center p-4 lg:p-8"
    >
      <div className="w-full max-w-6xl h-full lg:h-[90vh] glass-panel rounded-3xl overflow-hidden flex shadow-2xl shadow-indigo-900/10 border border-white/40">

        {/* Conversations List */}
        <div className={`w-full md:w-[380px] border-r border-slate-200/50 flex flex-col bg-white/40 backdrop-blur-sm ${effectiveSelectedId ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="h-20 border-b border-slate-200/50 flex items-center px-6 gap-4 shrink-0 bg-white/50">
            <motion.button whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }} onClick={onBack} className="md:hidden text-slate-700 p-2 -ml-2 rounded-full hover:bg-slate-200/50">
              <ArrowLeft size={24} />
            </motion.button>
            <h2 className="font-extrabold text-2xl tracking-tight text-slate-800">Messages</h2>
          </div>

          {/* Conversations */}
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 overflow-y-auto w-full scrollbar-hide py-2"
          >
            {conversations.map((conversation) => (
              <motion.button
                variants={itemVariants}
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full p-4 flex items-center gap-4 transition-all relative ${effectiveSelectedId === conversation.id ? 'bg-indigo-50/80 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1.5 before:bg-indigo-600 before:rounded-r-full' : 'hover:bg-white/60'
                  }`}
              >
                <div className="relative shrink-0">
                  <ImageWithFallback
                    src={conversation.user.avatar}
                    alt={conversation.user.name}
                    className="w-14 h-14 rounded-full object-cover shadow-sm ring-2 ring-white"
                  />
                  {conversation.user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0 pr-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-slate-800 text-sm truncate pr-2">{conversation.user.username}</p>
                    <p className="text-xs text-slate-500 font-medium shrink-0">{conversation.timestamp}</p>
                  </div>
                  <p className={`text-sm truncate ${conversation.unread ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                    {conversation.lastMessage}
                  </p>
                </div>
                {conversation.unread && (
                  <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full shrink-0 shadow-sm shadow-indigo-600/30"></div>
                )}
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Chat Window */}
        <div className={`flex-1 flex flex-col bg-white/60 backdrop-blur-md relative ${!effectiveSelectedId ? 'hidden md:flex' : 'flex'}`}>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none mix-blend-multiply"></div>

          {currentConversation ? (
            <>
            {/* Chat Header */}
            <div className="h-20 border-b border-slate-200/50 flex items-center justify-between px-6 bg-white/80 shrink-0 relative z-10 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectConversation('')}
                  className="md:hidden text-slate-700 p-2 -ml-2 rounded-full hover:bg-slate-200/50"
                >
                  <ArrowLeft size={24} />
                </motion.button>
                <div className="relative">
                  <ImageWithFallback
                    src={currentConversation.user.avatar}
                    alt={currentConversation.user.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-sm"
                  />
                  {currentConversation.user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-[15px]">{currentConversation.user.username}</p>
                  <p className="text-xs font-medium text-slate-500">
                    {currentConversation.user.isOnline ? <span className="text-emerald-500">Active now</span> : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="w-10 h-10 flex items-center justify-center rounded-full text-indigo-600 hover:bg-indigo-50 transition-colors">
                  <Phone size={20} strokeWidth={2.5} />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.95 }} 
                  onClick={() => onVideoCall && onVideoCall(currentConversation.user.username)}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <Video size={20} strokeWidth={2.5} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="w-10 h-10 flex items-center justify-center rounded-full text-indigo-600 hover:bg-indigo-50 transition-colors">
                  <Info size={20} strokeWidth={2.5} />
                </motion.button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 scrollbar-hide">
              <AnimatePresence initial={false}>
                {currentConversation.messages.map((message) => {
                  const isCurrentUser = message.senderId === currentUserId;
                  return (
                    <motion.div
                      variants={messageVariants}
                      initial="hidden"
                      animate="visible"
                      layout
                      key={message.id}
                      className={`flex w-full ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex flex-col max-w-[75%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-5 py-3 rounded-2xl shadow-sm ${isCurrentUser
                              ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm'
                              : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm'
                            }`}
                        >
                          <p className="text-[15px] leading-relaxed">{message.text}</p>
                        </div>
                        <span className="text-[11px] font-medium text-slate-400 mt-1.5 px-1">{message.timestamp}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white/80 border-t border-slate-200/50 backdrop-blur-xl relative z-10 shrink-0">
              <div className="flex items-center gap-3 bg-slate-100/80 p-2 rounded-full border border-slate-200/50 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white transition-all shadow-inner">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-full">
                  <Smile size={24} strokeWidth={2} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-full">
                  <ImageIcon size={24} strokeWidth={2} />
                </motion.button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 px-2 py-2 bg-transparent outline-none text-slate-700 placeholder:text-slate-400 font-medium"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!messageText.trim()}
                  className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-full disabled:opacity-50 disabled:bg-slate-400 hover:bg-indigo-700 hover:shadow-md transition-all ml-1"
                >
                  <Send size={18} className="translate-x-[1px] translate-y-[-1px]" strokeWidth={2.5} />
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50/50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center max-w-sm"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-100 border border-slate-100">
                <Send size={40} className="text-indigo-600 translate-x-1" strokeWidth={1.5} />
              </div>
              <h3 className="text-3xl font-extrabold text-slate-800 mb-3 tracking-tight">Your Messages</h3>
              <p className="text-slate-500 text-[15px] font-medium leading-relaxed">Choose a companion from your list to start a conversation, or discover new people.</p>
            </motion.div>
          </div>
        )}
      </div>
      </div>
    </motion.div>
  );
}
