import { Home, Search, PlusSquare, Heart, Menu, MessageCircle, BookOpen, Bell, Users } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'framer-motion';

interface NavigationProps {
  onCreatePost: () => void;
  onOpenMessages: () => void;
  onNavigate: (page: 'home' | 'yearbook' | 'noticeboard' | 'profile' | 'squarelife') => void;
  currentPage: string;
  currentUserAvatar: string;
}

export function Navigation({ onCreatePost, onOpenMessages, onNavigate, currentPage, currentUserAvatar }: NavigationProps) {
  const NavItem = ({ icon: Icon, page, isActive }: { icon: any, page: string, isActive: boolean }) => (
    <motion.button
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onNavigate(page as any)}
      className={`relative p-2 rounded-xl transition-colors ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
        }`}
    >
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? 'currentColor' : 'none'} />
      {isActive && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"
        />
      )}
    </motion.button>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 glass-panel border-b-0 border-white/50 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('home')}
            className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight"
          >
            students^2
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <NavItem icon={Home} page="home" isActive={currentPage === 'home'} />
            <NavItem icon={BookOpen} page="yearbook" isActive={currentPage === 'yearbook'} />
            <NavItem icon={Users} page="squarelife" isActive={currentPage === 'squarelife'} />
            <NavItem icon={Bell} page="noticeboard" isActive={currentPage === 'noticeboard'} />

            <div className="w-px h-6 bg-slate-200 mx-2" />

            <motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenMessages}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <MessageCircle size={24} strokeWidth={2} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreatePost}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <PlusSquare size={24} strokeWidth={2} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('profile')}
              className={`ml-2 transition-all rounded-full p-0.5 ${currentPage === 'profile' ? 'bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md' : 'hover:shadow-md'
                }`}
            >
              <ImageWithFallback
                src={currentUserAvatar}
                alt="Your profile"
                className="w-8 h-8 rounded-full object-cover border-2 border-white/80"
              />
            </motion.button>
          </div>

          {/* Mobile Navigation */}
          <button className="md:hidden text-slate-600 hover:text-indigo-600">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
}