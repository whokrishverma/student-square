import { useState, useEffect } from 'react';
import { Video, Phone, MessageSquare, SkipForward, X, Mic, MicOff, VideoOff, Settings } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'framer-motion';

type ConnectionType = 'video' | 'voice' | 'chat';
type ConnectionStatus = 'idle' | 'searching' | 'connected';

interface RandomUser {
  name: string;
  username: string;
  avatar: string;
  interests: string[];
  year: string;
  department: string;
}

const randomUsers: RandomUser[] = [
  {
    name: 'Aman Tiwari',
    username: 'amant',
    avatar: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    interests: ['Photography', 'Music', 'Travel'],
    year: 'Junior',
    department: 'Computer Science',
  },
  {
    name: 'Maya Patel',
    username: 'mayap',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    interests: ['Art', 'Design', 'Cooking'],
    year: 'Sophomore',
    department: 'Fine Arts',
  },
  {
    name: 'Rahul Deshmukh',
    username: 'rahuld',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    interests: ['Sports', 'Gaming', 'Movies'],
    year: 'Senior',
    department: 'Business',
  },
];

export function SquareLifePage() {
  const [selectedType, setSelectedType] = useState<ConnectionType | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [currentUser, setCurrentUser] = useState<RandomUser | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'you' | 'stranger'; text: string }>>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const startConnection = (type: ConnectionType) => {
    setSelectedType(type);
    setStatus('searching');
    setChatMessages([]);

    // Simulate finding a match
    setTimeout(() => {
      const randomUser = randomUsers[Math.floor(Math.random() * randomUsers.length)];
      setCurrentUser(randomUser);
      setStatus('connected');

      if (type === 'chat') {
        setChatMessages([
          { sender: 'stranger', text: 'Hey! How are you?' }
        ]);
      }
    }, 2000);
  };

  const skipUser = () => {
    setStatus('searching');
    setChatMessages([]);

    setTimeout(() => {
      const randomUser = randomUsers[Math.floor(Math.random() * randomUsers.length)];
      setCurrentUser(randomUser);
      setStatus('connected');

      if (selectedType === 'chat') {
        setChatMessages([
          { sender: 'stranger', text: 'Hi there! Nice to meet you!' }
        ]);
      }
    }, 1500);
  };

  const endConnection = () => {
    setStatus('idle');
    setSelectedType(null);
    setCurrentUser(null);
    setChatMessages([]);
    setIsMuted(false);
    setIsVideoOff(false);
  };

  const sendMessage = () => {
    if (messageInput.trim() && selectedType === 'chat') {
      setChatMessages([...chatMessages, { sender: 'you', text: messageInput }]);
      setMessageInput('');

      // Simulate stranger reply
      setTimeout(() => {
        const responses = [
          'That\'s cool!',
          'I totally agree!',
          'Tell me more about that',
          'Interesting perspective!',
          'What do you think about campus life?',
        ];
        setChatMessages(prev => [
          ...prev,
          { sender: 'stranger', text: responses[Math.floor(Math.random() * responses.length)] }
        ]);
      }, 1000);
    }
  };

  // Idle state - Choose connection type
  if (status === 'idle') {
    return (
      <div className="min-h-screen bg-stone-50 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 -right-40 w-96 h-96 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-40 w-96 h-96 bg-pink-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-[1000px] mx-auto pt-28 px-4 pb-20 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center p-4 bg-indigo-100/50 rounded-3xl mb-6 shadow-sm ring-1 ring-indigo-500/10">
              <span className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse mr-3"></span>
              <span className="text-indigo-900 font-bold uppercase tracking-widest text-sm">Live Connections</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-slate-900">
              Square <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Life</span>
            </h1>
            <p className="text-xl font-medium text-slate-500 max-w-2xl mx-auto mb-2">Connect instantly with random students from across campus.</p>
            <p className="text-slate-400 text-sm">Make new friends, share experiences, and expand your network.</p>
          </motion.div>

          {/* Connection Type Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16"
          >
            {/* Video Call */}
            <motion.button
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startConnection('video')}
              className="glass-panel p-8 text-center group cursor-pointer"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow transition-transform group-hover:scale-110 duration-300">
                <Video size={36} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-800">Video Call</h3>
              <p className="text-slate-500 font-medium">Connect face-to-face with someone new on campus</p>
            </motion.button>

            {/* Voice Call */}
            <motion.button
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startConnection('voice')}
              className="glass-panel p-8 text-center group cursor-pointer"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-shadow transition-transform group-hover:scale-110 duration-300">
                <Phone size={36} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-800">Voice Call</h3>
              <p className="text-slate-500 font-medium">Have an engaging voice conversation</p>
            </motion.button>

            {/* Text Chat */}
            <motion.button
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startConnection('chat')}
              className="glass-panel p-8 text-center group cursor-pointer"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow transition-transform group-hover:scale-110 duration-300">
                <MessageSquare size={36} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-800">Text Chat</h3>
              <p className="text-slate-500 font-medium">Start a quick text conversation</p>
            </motion.button>
          </motion.div>

          {/* Safety Guidelines */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto glass-panel p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start"
          >
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-2xl">🛡️</span>
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-slate-800 mb-4">Safety Guidelines</h3>
              <ul className="space-y-3 text-slate-600 font-medium">
                <li className="flex items-start gap-3">
                  <span className="text-indigo-500 mt-0.5">•</span>
                  Be respectful and kind to everyone you meet
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-500 mt-0.5">•</span>
                  Don't share personal information like phone numbers or addresses
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-500 mt-0.5">•</span>
                  Report any inappropriate behavior immediately
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-500 mt-0.5">•</span>
                  Have fun and make meaningful connections!
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Searching state
  if (status === 'searching') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-24 h-24 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold mb-2">Finding someone for you...</h2>
          <p className="text-lg opacity-90">This may take a few moments</p>
        </div>
      </div>
    );
  }

  // Connected state - Video Call
  if (status === 'connected' && selectedType === 'video' && currentUser) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="h-screen flex flex-col">
          {/* Video Area */}
          <div className="flex-1 relative">
            {/* Stranger Video (Main) */}
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              {isVideoOff ? (
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <VideoOff size={48} className="text-gray-400" />
                  </div>
                  <p className="text-white text-xl">Camera is off</p>
                </div>
              ) : (
                <ImageWithFallback
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              )}

              {/* User Info Overlay */}
              <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-3 text-white">
                <p className="font-semibold text-lg">{currentUser.name}</p>
                <p className="text-sm opacity-90">{currentUser.department} • {currentUser.year}</p>
                <div className="flex gap-2 mt-2">
                  {currentUser.interests.map((interest, idx) => (
                    <span key={idx} className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Your Video (PIP) */}
            <div className="absolute bottom-6 right-6 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-white/20">
              <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                <p className="text-white text-sm">You</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-800 p-6">
            <div className="max-w-2xl mx-auto flex items-center justify-center gap-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
              >
                {isMuted ? <MicOff className="text-white" /> : <Mic className="text-white" />}
              </button>

              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
              >
                {isVideoOff ? <VideoOff className="text-white" /> : <Video className="text-white" />}
              </button>

              <button
                onClick={endConnection}
                className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition"
              >
                <X size={28} className="text-white" />
              </button>

              <button
                onClick={skipUser}
                className="w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition"
              >
                <SkipForward className="text-white" />
              </button>

              <button className="w-14 h-14 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition">
                <Settings className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Connected state - Voice Call
  if (status === 'connected' && selectedType === 'voice' && currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-teal-500 to-blue-500 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center text-white">
            {/* Avatar */}
            <ImageWithFallback
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-40 h-40 rounded-full object-cover mx-auto mb-6 border-4 border-white/30 shadow-2xl"
            />

            {/* User Info */}
            <h2 className="text-3xl font-bold mb-2">{currentUser.name}</h2>
            <p className="text-lg opacity-90 mb-1">{currentUser.department}</p>
            <p className="text-sm opacity-75 mb-4">{currentUser.year}</p>

            {/* Interests */}
            <div className="flex justify-center gap-2 mb-8">
              {currentUser.interests.map((interest, idx) => (
                <span key={idx} className="text-xs bg-white/20 px-3 py-1 rounded-full">
                  {interest}
                </span>
              ))}
            </div>

            {/* Call Duration */}
            <div className="text-xl mb-8 opacity-75">
              <span className="animate-pulse">●</span> 00:42
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'
                  }`}
              >
                {isMuted ? <MicOff size={24} className="text-white" /> : <Mic size={24} className="text-white" />}
              </button>

              <button
                onClick={endConnection}
                className="w-20 h-20 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition shadow-xl"
              >
                <X size={32} className="text-white" />
              </button>

              <button
                onClick={skipUser}
                className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
              >
                <SkipForward size={24} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Connected state - Text Chat
  if (status === 'connected' && selectedType === 'chat' && currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto h-screen flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ImageWithFallback
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-100 shadow-sm"
              />
              <div>
                <p className="font-semibold">{currentUser.name}</p>
                <p className="text-sm text-gray-500">{currentUser.department} • {currentUser.year}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={skipUser}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
              >
                <SkipForward size={18} />
                Next
              </button>
              <button
                onClick={endConnection}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                End Chat
              </button>
            </div>
          </div>

          {/* Interests Tags */}
          <div className="bg-purple-50 px-4 py-3 border-b border-purple-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Interests:</span>
              {currentUser.interests.map((interest, idx) => (
                <span key={idx} className="text-sm bg-purple-200 text-purple-800 px-3 py-1 rounded-full">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'you' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${msg.sender === 'you'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                    }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full outline-none focus:border-purple-500"
              />
              <button
                onClick={sendMessage}
                className="px-6 py-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition font-semibold"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
