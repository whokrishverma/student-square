import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'framer-motion';

interface SuggestedUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

interface SidebarProps {
  currentUser: {
    name: string;
    username: string;
    avatar: string;
  };
  suggestedUsers: SuggestedUser[];
  onUserClick: (username: string) => void;
}

export function Sidebar({ currentUser, suggestedUsers, onUserClick }: SidebarProps) {
  return (
    <div className="hidden lg:block w-[320px] fixed right-0 top-16 h-[calc(100vh-4rem)] p-8 overflow-y-auto scrollbar-hide shrink-0 z-40 bg-stone-50/10">
      {/* Current User */}
      <motion.div
        whileHover={{ y: -2 }}
        className="flex items-center gap-4 mb-8 glass-panel p-4 rounded-2xl cursor-pointer hover:shadow-lg transition-all"
      >
        <ImageWithFallback
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-50/50 shadow-sm"
        />
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-slate-800 text-sm truncate">{currentUser.username}</p>
          <p className="text-slate-500 text-sm font-medium truncate">{currentUser.name}</p>
        </div>
        <button className="text-indigo-600 text-xs font-bold hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded-md transition-colors shrink-0">
          Switch
        </button>
      </motion.div>

      {/* Suggestions */}
      <div className="glass-panel p-5 rounded-3xl mb-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider">Suggested For You</h3>
          <button className="text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors">See All</button>
        </div>

        <div className="space-y-5">
          {suggestedUsers.map((user) => (
            <motion.div
              whileHover={{ x: 2 }}
              key={user.id}
              className="flex items-center gap-4 group cursor-pointer"
              onClick={() => onUserClick(user.username)}
            >
              <ImageWithFallback
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm group-hover:ring-indigo-50 transition-all"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate group-hover:text-indigo-600 transition-colors">{user.username}</p>
                <p className="text-slate-500 text-xs font-medium truncate">Suggested for you</p>
              </div>
              <button className="text-white bg-slate-900 hover:bg-indigo-600 text-xs font-bold px-4 py-1.5 rounded-full transition-colors shadow-sm shrink-0">
                Follow
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-xs font-medium text-slate-400 space-y-3 px-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <a href="#" className="hover:text-indigo-500 transition-colors">About</a>
          <a href="#" className="hover:text-indigo-500 transition-colors">Help</a>
          <a href="#" className="hover:text-indigo-500 transition-colors">Press</a>
          <a href="#" className="hover:text-indigo-500 transition-colors">API</a>
          <a href="#" className="hover:text-indigo-500 transition-colors">Jobs</a>
          <a href="#" className="hover:text-indigo-500 transition-colors">Privacy</a>
          <a href="#" className="hover:text-indigo-500 transition-colors">Terms</a>
        </div>
        <p className="uppercase tracking-widest font-bold text-slate-300 mt-4">© 2026 students^2</p>
      </div>
    </div>
  );
}