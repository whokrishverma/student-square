import { useState } from 'react';
import { Search, Filter, Camera } from 'lucide-react';
import { Post, PostType } from './Post';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'framer-motion';

interface YearbookPageProps {
  posts: PostType[];
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  likedPosts: Set<string>;
  onUserClick: (username: string) => void;
}

export function YearbookPage({ posts, onLike, onComment, likedPosts, onUserClick }: YearbookPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'trending', 'recent', 'popular'];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.caption.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as any } }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-[1200px] mx-auto pt-28 px-4 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Camera size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight text-slate-900">Digital Yearbook</h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">Discover memories, connect with classmates, and explore the diverse community on campus.</p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-3xl p-3 mb-12 shadow-sm"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-2 flex flex-col md:flex-row gap-2 items-stretch">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search students, captions, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-100/50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 bg-slate-100/50 px-4 rounded-xl border-t md:border-t-0 md:border-l border-slate-200/50 md:rounded-l-none">
              <Filter size={20} className="text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-3.5 bg-transparent border-none outline-none text-slate-700 font-bold focus:ring-0 cursor-pointer"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Featured Students */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-14 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Featured Students
            </h2>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide px-2">
            {posts.slice(0, 8).map((post, i) => (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ y: -5, scale: 1.05 }}
                key={post.user.username}
                onClick={() => onUserClick(post.user.username)}
                className="flex flex-col items-center gap-3 shrink-0 group relative"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full blur-sm opacity-0 group-hover:opacity-60 transition-opacity"></div>
                  <ImageWithFallback
                    src={post.user.avatar}
                    alt={post.user.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md relative z-10"
                  />
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors w-24 truncate">
                    {post.user.name.split(' ')[0]}
                  </p>
                  <p className="text-xs font-medium text-slate-400">@{post.user.username}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Posts Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredPosts.map((post) => (
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              key={post.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-slate-200 hover:shadow-xl hover:shadow-indigo-900/5 transition-all group"
            >
              {/* Post Image */}
              {post.image && (
                <div className="relative overflow-hidden aspect-square">
                  <ImageWithFallback
                    src={post.image}
                    alt="Post content"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              )}

              {/* Post Info & Actions */}
              <div className="p-5">
                {/* User Header */}
                <button
                  onClick={() => onUserClick(post.user.username)}
                  className="flex items-center gap-3 mb-4 w-full text-left group/user relative z-10"
                >
                  <ImageWithFallback
                    src={post.user.avatar}
                    alt={post.user.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-50 shadow-sm"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate group-hover/user:text-indigo-600 transition-colors">{post.user.name}</p>
                    <p className="text-slate-500 text-xs font-medium truncate">@{post.user.username}</p>
                  </div>
                </button>

                {/* Post Content */}
                <div>
                  <p className="text-sm mb-4 line-clamp-2 text-slate-600 leading-relaxed font-medium">{post.caption}</p>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wide">
                    <span className="flex items-center gap-1"><span className="text-indigo-500">{post.likes.toLocaleString()}</span> likes</span>
                    <span>{post.comments.length} comments</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300"
          >
            <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-700 mb-2">No memories found</h3>
            <p className="text-slate-500 font-medium">Try different search terms to explore the yearbook.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
