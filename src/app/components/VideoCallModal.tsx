import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneOff, Mic, MicOff, Video, VideoOff, MessageSquare } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUsername: string;
}

export function VideoCallModal({ isOpen, onClose, targetUsername }: VideoCallModalProps) {
  const [callState, setCallState] = useState<'connecting' | 'ringing' | 'connected' | 'ended'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCallState('connecting');
      setDuration(0);
      return;
    }

    // Simulate call flow
    let timeouts: NodeJS.Timeout[] = [];
    
    timeouts.push(setTimeout(() => setCallState('ringing'), 1000));
    timeouts.push(setTimeout(() => setCallState('connected'), 4000));
    
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const handleEndCall = () => {
    setCallState('ended');
    setTimeout(onClose, 1000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center font-sans"
        >
          {/* Main Video Area (Simulated target user) */}
          <div className="absolute inset-0 bg-slate-900 flex items-center justify-center overflow-hidden">
            {callState === 'connected' ? (
              <img 
                src="https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?q=80&w=1600&auto=format&fit=crop" 
                alt="Target Video" 
                className="w-full h-full object-cover opacity-80"
              />
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-800 ring-4 ring-indigo-500/30 mb-6">
                  <div className="w-full h-full flex items-center justify-center text-5xl text-white font-bold bg-gradient-to-br from-indigo-600 to-purple-600">
                    {targetUsername.substring(0, 1).toUpperCase()}
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">@{targetUsername}</h2>
                <p className="text-slate-400 font-medium text-lg">
                  {callState === 'connecting' && 'Connecting...'}
                  {callState === 'ringing' && 'Ringing...'}
                  {callState === 'ended' && 'Call Ended'}
                </p>
              </div>
            )}
          </div>

          {/* Self Video (Simulated) */}
          {callState === 'connected' && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-6 right-6 w-32 md:w-48 aspect-[3/4] bg-slate-800 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/20 z-10"
            >
              {!isVideoOff ? (
                <img 
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop" 
                  alt="Self Video" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  <VideoOff size={32} />
                </div>
              )}
            </motion.div>
          )}

          {/* Call Controls */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
            {callState === 'connected' && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur px-4 py-1.5 rounded-full text-white font-mono text-sm tracking-wider">
                {formatDuration(duration)}
              </div>
            )}
            
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-white text-slate-900' : 'bg-slate-800/80 text-white hover:bg-slate-700'} backdrop-blur`}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            
            <button 
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-white text-slate-900' : 'bg-slate-800/80 text-white hover:bg-slate-700'} backdrop-blur`}
            >
              {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
            </button>
            
            <button 
              onClick={handleEndCall}
              className="w-16 h-16 rounded-full flex items-center justify-center bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <PhoneOff size={28} />
            </button>
            
            <button className="w-14 h-14 rounded-full flex items-center justify-center bg-slate-800/80 text-white hover:bg-slate-700 backdrop-blur transition-all">
              <MessageSquare size={24} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
