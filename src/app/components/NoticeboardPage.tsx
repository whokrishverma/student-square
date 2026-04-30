import { useState } from 'react';
import { Pin, Calendar, MapPin, Users, Filter, Bell, Search } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion, AnimatePresence } from 'framer-motion';

export interface Notice {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    type: 'department' | 'club' | 'admin';
    avatar?: string;
  };
  date: string;
  isPinned: boolean;
  category: string;
  location?: string;
  attendees?: number;
}

interface NoticeboardPageProps {
  notices: Notice[];
}

export function NoticeboardPage({ notices }: NoticeboardPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', 'academics', 'events', 'clubs', 'sports', 'announcements'];

  const filteredNotices = notices.filter((notice) => {
    const matchesCategory = selectedCategory === 'all' || notice.category === selectedCategory;
    const matchesSearch =
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.author.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const pinnedNotices = filteredNotices.filter((n) => n.isPinned);
  const regularNotices = filteredNotices.filter((n) => !n.isPinned);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      academics: 'bg-blue-100 text-blue-700 ring-1 ring-blue-500/20',
      events: 'bg-purple-100 text-purple-700 ring-1 ring-purple-500/20',
      clubs: 'bg-green-100 text-green-700 ring-1 ring-green-500/20',
      sports: 'bg-orange-100 text-orange-700 ring-1 ring-orange-500/20',
      announcements: 'bg-rose-100 text-rose-700 ring-1 ring-rose-500/20',
    };
    return colors[category] || 'bg-slate-100 text-slate-700 ring-1 ring-slate-500/20';
  };

  const getAuthorTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      department: 'bg-indigo-50 border-indigo-200 text-indigo-600',
      club: 'bg-emerald-50 border-emerald-200 text-emerald-600',
      admin: 'bg-purple-50 border-purple-200 text-purple-600',
    };
    return colors[type] || 'bg-slate-50 border-slate-200 text-slate-600';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as any } }
  };

  const NoticeCard = ({ notice }: { notice: Notice }) => (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all relative overflow-hidden ${notice.isPinned ? 'ring-1 ring-amber-400/50 outline outline-4 outline-amber-50/50' : 'ring-1 ring-slate-200'
        }`}
    >
      {notice.isPinned && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_15px_rgba(251,191,36,0.5)] z-10" />
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mb-5 relative z-10">
        {notice.author.avatar ? (
          <ImageWithFallback
            src={notice.author.avatar}
            alt={notice.author.name}
            className="w-14 h-14 rounded-xl object-cover ring-2 ring-slate-50 shadow-sm"
          />
        ) : (
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${getAuthorTypeColor(notice.author.type)} shadow-sm`}>
            <Bell size={26} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-extrabold text-xl mb-1.5 text-slate-800 tracking-tight leading-tight pr-4">{notice.title}</h3>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-sm font-semibold text-slate-700">{notice.author.name}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                  <Calendar size={14} />
                  {notice.date}
                </span>
              </div>
            </div>
            {notice.isPinned && (
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full font-bold text-xs border border-amber-200 shrink-0">
                <Pin size={14} className="fill-amber-500" />
                Pinned
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <p className="text-slate-600 mb-6 leading-relaxed relative z-10">{notice.content}</p>

      {/* Footer Meta Info & Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 relative z-10 pt-4 border-t border-slate-100">
        <span className={`inline-block px-3.5 py-1.5 rounded-full text-[11px] font-extrabold tracking-wider uppercase ${getCategoryColor(notice.category)}`}>
          {notice.category}
        </span>

        <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-slate-500">
          {notice.location && (
            <div className="flex items-center gap-1.5">
              <MapPin size={16} className="text-slate-400" />
              <span>{notice.location}</span>
            </div>
          )}
          {notice.attendees && (
            <div className="flex items-center gap-1.5">
              <Users size={16} className="text-slate-400" />
              <span>{notice.attendees} interested</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-[1000px] mx-auto pt-28 px-4 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl font-extrabold mb-3 tracking-tight text-slate-900">Noticeboard</h1>
            <p className="text-slate-500 font-medium text-lg">Stay updated with official announcements</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition"
          >
            <Bell size={20} strokeWidth={2.5} />
            Subscribe to Updates
          </motion.button>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-2xl p-2 mb-10 overflow-hidden"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search notices, events, clubs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-100/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400 shadow-inner"
              />
            </div>

            {/* Category Filters */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide shrink-0 pl-1">
              <Filter size={18} className="text-slate-400 mr-1 hidden sm:block" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === category
                    ? 'bg-slate-800 text-white shadow-md shadow-slate-800/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Notices Feed */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Pinned Notices */}
          {pinnedNotices.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-slate-800 uppercase tracking-widest">
                <Pin size={18} className="text-amber-500 fill-amber-500" />
                Featured & Pinned
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pinnedNotices.map((notice) => (
                  <NoticeCard key={notice.id} notice={notice} />
                ))}
              </div>
            </div>
          )}

          {/* Regular Notices */}
          {(regularNotices.length > 0 || pinnedNotices.length > 0) && (
            <div>
              {pinnedNotices.length > 0 && (
                <h2 className="text-lg font-bold mb-5 text-slate-800 uppercase tracking-widest">Latest Updates</h2>
              )}
              <div className="space-y-6 max-w-3xl">
                {regularNotices.map((notice) => (
                  <NoticeCard key={notice.id} notice={notice} />
                ))}
              </div>
            </div>
          )}

          {filteredNotices.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 glass-panel rounded-3xl max-w-2xl mx-auto"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center shadow-inner">
                <Bell size={40} className="text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">No notices found</h3>
              <p className="text-slate-500 font-medium">Try adjusting your filters or search query.</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
