import { useState } from 'react';
import { Settings, Grid, Bookmark, Tag, MapPin, Link as LinkIcon, Calendar, Edit3, UserPlus, MessageCircle, Camera, X, LogOut } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PostType } from './Post';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfilePageProps {
  user: {
    name: string;
    username: string;
    avatar: string;
    bio?: string;
    followers: number;
    following: number;
    location?: string;
    website?: string;
  };
  posts: PostType[];
  isOwnProfile: boolean;
  onBack: () => void;
  onUpdateProfile?: (updates: {
    fullName?: string;
    bio?: string;
    avatarUrl?: string;
    location?: string;
    website?: string;
  }) => Promise<void>;
  onLogout?: () => void;
  onMessageClick?: () => void;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
}

export function ProfilePage({ user, posts, isOwnProfile, isFollowing, onBack, onUpdateProfile, onLogout, onMessageClick, onToggleFollow }: ProfilePageProps) {
  const userPosts = posts.filter((post) => post.user.username === user.username);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: user.name,
    bio: user.bio || '',
    avatarUrl: user.avatar || '',
    location: user.location || '',
    website: user.website || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = async () => {
    if (!onUpdateProfile) return;
    setIsSaving(true);
    setSaveMessage('');
    try {
      await onUpdateProfile({
        fullName: editForm.fullName,
        bio: editForm.bio,
        avatarUrl: editForm.avatarUrl,
        location: editForm.location,
        website: editForm.website,
      });
      setSaveMessage('Profile updated successfully!');
      setTimeout(() => {
        setShowEditModal(false);
        setSaveMessage('');
      }, 1000);
    } catch {
      setSaveMessage('Failed to save. Please try again.');
    }
    setIsSaving(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as any } }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Cover Photo */}
      <div className="h-64 md:h-80 w-full relative overflow-hidden bg-slate-200">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/80 to-purple-600/80 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop"
          alt="Cover"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-6 md:p-10 mb-8 shadow-xl shadow-indigo-900/5 relative"
        >
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            {/* Avatar Section */}
            <div className="flex flex-col items-center md:items-start shrink-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative -mt-20 md:-mt-24 mb-4 ring-8 ring-white rounded-full bg-white shadow-lg inline-block"
              >
                <ImageWithFallback
                  src={user.avatar}
                  alt={user.name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover"
                />
                {isOwnProfile && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="absolute bottom-2 right-2 bg-indigo-600 p-2.5 rounded-full text-white hover:bg-indigo-700 transition-colors shadow-md hover:scale-110 active:scale-95"
                  >
                    <Camera size={18} />
                  </button>
                )}
              </motion.div>
            </div>

            {/* Profile Info Section */}
            <div className="flex-1 text-center md:text-left pt-2 md:pt-0">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 mb-1">{user.name}</h1>
                  <p className="text-indigo-600 font-bold text-lg mb-4">@{user.username}</p>
                  <p className="text-slate-600 text-[15px] leading-relaxed max-w-lg mx-auto md:mx-0 font-medium">
                    {user.bio || 'Computer Science Senior 💻 | Photography enthusiast 📸 | Exploring the world one line of code at a time ✨'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-center md:justify-end gap-3 shrink-0">
                  {isOwnProfile ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowEditModal(true)}
                        className="px-6 py-2.5 bg-slate-100 text-slate-800 rounded-xl font-bold hover:bg-slate-200 transition flex items-center gap-2"
                      >
                        <Edit3 size={18} />
                        Edit Profile
                      </motion.button>
                      <div className="relative">
                        <motion.button
                          whileHover={{ scale: 1.02, rotate: 90 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                          className="p-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition"
                        >
                          <Settings size={20} />
                        </motion.button>
                        {showSettingsMenu && (
                          <div className="absolute right-0 top-12 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 min-w-[160px]">
                            <button
                              onClick={() => {
                                setShowSettingsMenu(false);
                                onLogout?.();
                              }}
                              className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 font-semibold flex items-center gap-2 text-sm"
                            >
                              <LogOut size={16} />
                              Sign Out
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onToggleFollow}
                        className={`px-8 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shadow-lg ${
                          isFollowing 
                            ? 'bg-slate-200 text-slate-800 hover:bg-slate-300 shadow-slate-200/30' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30'
                        }`}
                      >
                        <UserPlus size={18} />
                        {isFollowing ? 'Following' : 'Follow'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onMessageClick}
                        className="px-6 py-2.5 bg-slate-100 text-slate-800 rounded-xl font-bold hover:bg-slate-200 transition flex items-center gap-2"
                      >
                        <MessageCircle size={18} />
                        Message
                      </motion.button>
                    </>
                  )}
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 mb-6 text-sm font-medium text-slate-500">
                <span className="flex items-center gap-2"><MapPin size={16} className="text-slate-400" /> {user.location || 'Bennett University'}</span>
                {user.website && (
                  <span className="flex items-center gap-2"><LinkIcon size={16} className="text-slate-400" /> <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{user.website}</a></span>
                )}
                <span className="flex items-center gap-2"><Calendar size={16} className="text-slate-400" /> Joined Sept 2023</span>
              </div>

              {/* Stats */}
              <div className="flex justify-center md:justify-start gap-8 py-4 border-t border-slate-200/60">
                <div className="text-center md:text-left cursor-pointer group">
                  <span className="block text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{userPosts.length}</span>
                  <span className="text-slate-500 font-bold text-xs tracking-wider uppercase">Posts</span>
                </div>
                <div className="text-center md:text-left cursor-pointer group">
                  <span className="block text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{user.followers.toLocaleString()}</span>
                  <span className="text-slate-500 font-bold text-xs tracking-wider uppercase">Followers</span>
                </div>
                <div className="text-center md:text-left cursor-pointer group">
                  <span className="block text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{user.following.toLocaleString()}</span>
                  <span className="text-slate-500 font-bold text-xs tracking-wider uppercase">Following</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="glass-panel p-1.5 rounded-2xl inline-flex gap-2">
            <button className="flex items-center gap-2 px-8 py-3 bg-white text-indigo-600 shadow-sm rounded-xl text-sm font-bold transition-all">
              <Grid size={18} />
              Posts
            </button>
            <button className="flex items-center gap-2 px-8 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 rounded-xl text-sm font-bold transition-all">
              <Bookmark size={18} />
              Saved
            </button>
            <button className="flex items-center gap-2 px-8 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 rounded-xl text-sm font-bold transition-all">
              <Tag size={18} />
              Tagged
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        <div>
          {userPosts.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
            >
              {userPosts.map((post) => (
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  key={post.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-slate-200 hover:shadow-xl hover:shadow-indigo-900/5 transition-all group cursor-pointer"
                >
                  {post.image ? (
                    <div className="aspect-square relative overflow-hidden">
                      <ImageWithFallback
                        src={post.image}
                        alt={post.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 pointer-events-none">
                        <div className="text-white flex items-center gap-4 font-bold text-sm">
                          <span>❤️ {post.likes}</span>
                          <span>💬 {post.comments.length}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-50 to-purple-50 group-hover:from-indigo-100 group-hover:to-purple-100 transition-colors">
                      <p className="text-lg font-medium text-slate-800 text-center line-clamp-4 leading-relaxed">{post.caption}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 glass-panel rounded-3xl"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center ring-8 ring-slate-50">
                <Camera size={40} className="text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Share Photos</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto">When you share photos, they will appear on your profile.</p>
              {isOwnProfile && (
                <button className="mt-6 font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-6 py-2 rounded-full transition-colors">
                  Share your first photo
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">Edit Profile</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Avatar Preview */}
                <div className="flex items-center gap-4">
                  <ImageWithFallback
                    src={editForm.avatarUrl || user.avatar}
                    alt="Avatar preview"
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-50"
                  />
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Avatar URL
                    </label>
                    <input
                      type="text"
                      value={editForm.avatarUrl}
                      onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                    placeholder="Your full name"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm min-h-[80px] resize-none"
                    placeholder="Tell the world about yourself..."
                    maxLength={200}
                  />
                  <p className="text-xs text-slate-400 mt-1">{editForm.bio.length}/200 characters</p>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                    placeholder="e.g., New Delhi, India"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Website
                  </label>
                  <input
                    type="text"
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                    placeholder="https://yourportfolio.dev"
                  />
                </div>

                {/* Save Message */}
                {saveMessage && (
                  <p className={`text-sm font-medium text-center p-2 rounded-lg ${saveMessage.includes('success') ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                    {saveMessage}
                  </p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-70"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
