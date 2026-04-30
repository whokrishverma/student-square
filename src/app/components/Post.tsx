import { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion, AnimatePresence } from 'framer-motion';

export interface PostType {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  image?: string;
  caption: string;
  likes: number;
  comments: Comment[];
  timestamp: string;
}

interface Comment {
  id: string;
  user: string;
  text: string;
}

interface PostProps {
  post: PostType;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  isLiked: boolean;
  onUserClick?: (username: string) => void;
}

export function Post({ post, onLike, onComment, isLiked, onUserClick }: PostProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);

  const handleComment = () => {
    if (commentText.trim()) {
      onComment(post.id, commentText);
      setCommentText('');
    }
  };

  const handleLikeClick = () => {
    setIsLiking(true);
    onLike(post.id);
    setTimeout(() => setIsLiking(false), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 hover:shadow-md transition-shadow mb-6 overflow-hidden"
    >
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onUserClick && onUserClick(post.user.username)}
        >
          <motion.div whileHover={{ scale: 1.05 }}>
            <ImageWithFallback
              src={post.user.avatar}
              alt={post.user.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-50/50"
            />
          </motion.div>
          <div>
            <p className="font-bold text-slate-800 text-sm cursor-pointer group-hover:text-indigo-600 transition-colors">{post.user.name}</p>
            <p className="text-slate-500 text-xs font-medium">{post.timestamp}</p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-slate-50">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="relative group overflow-hidden">
          <ImageWithFallback
            src={post.image}
            alt="Post content"
            className="w-full object-cover max-h-[600px]"
          />
        </div>
      )}

      {/* Post Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLikeClick}
              className={`transition-colors p-1 -ml-1 ${isLiked ? 'text-rose-500' : 'text-slate-600 hover:text-rose-500'
                }`}
            >
              <motion.div
                animate={isLiking ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart size={26} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={isLiked ? 0 : 2} />
              </motion.div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowComments(!showComments)}
              className="text-slate-600 hover:text-indigo-600 transition-colors p-1"
            >
              <MessageCircle size={26} strokeWidth={2} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, x: 2, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="text-slate-600 hover:text-indigo-600 transition-colors p-1"
            >
              <Send size={26} strokeWidth={2} />
            </motion.button>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-slate-600 hover:text-indigo-600 transition-colors p-1"
          >
            <Bookmark size={26} strokeWidth={2} />
          </motion.button>
        </div>

        {/* Likes Count */}
        <p className="font-bold text-slate-800 text-sm mb-2">{post.likes.toLocaleString()} likes</p>

        {/* Caption */}
        <div className="text-sm mb-2 leading-relaxed">
          <span className="font-bold text-slate-800 mr-2 hover:underline cursor-pointer">{post.user.username}</span>
          <span className="text-slate-600">{post.caption}</span>
        </div>

        {/* Comments */}
        {post.comments.length > 0 && (
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-slate-400 font-medium text-sm mb-2 hover:text-slate-600 transition-colors"
          >
            View all {post.comments.length} comments
          </button>
        )}

        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2 mb-3 overflow-hidden"
            >
              {post.comments.map((comment) => (
                <div key={comment.id} className="text-sm leading-relaxed">
                  <span className="font-bold text-slate-800 mr-2 hover:underline cursor-pointer">{comment.user}</span>
                  <span className="text-slate-600">{comment.text}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Comment */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 relative">
          <ImageWithFallback
            src={post.user.avatar} // Ideally this is the current user's avatar, using post author's as fallback
            alt="Your avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleComment()}
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400 text-slate-700"
          />
          {commentText && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleComment}
              className="text-indigo-600 font-bold text-sm hover:text-indigo-700 transition-colors"
            >
              Post
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
