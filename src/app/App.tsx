import { useState, useEffect, useCallback } from 'react';
import { Navigation } from './components/Navigation';
import { Post, PostType } from './components/Post';
import { CreatePostModal } from './components/CreatePostModal';
import { Sidebar } from './components/Sidebar';
import { MessagesPage, Conversation } from './components/MessagesPage';
import { VideoCallModal } from './components/VideoCallModal';
import { LoginSignupPage } from './components/LoginSignupPage';
import { ProfilePage } from './components/ProfilePage';
import { YearbookPage } from './components/YearbookPage';
import { NoticeboardPage, Notice } from './components/NoticeboardPage';
import { SquareLifePage } from './components/SquareLifePage';
import { Home, BookOpen, Bell, MessageCircle, User, Users } from 'lucide-react';
import { PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AuthUser } from './api/auth';
import {
  fetchPosts,
  createPost as apiCreatePost,
  toggleLike as apiToggleLike,
  addComment as apiAddComment,
  fetchConversations,
  sendMessage as apiSendMessage,
  fetchNotices,
  fetchSuggestedUsers,
  fetchProfile,
  fetchUserByUsername,
  updateProfile as apiUpdateProfile,
  toggleFollow as apiToggleFollow,
  fetchFollowStatus,
  type ApiUserProfile,
} from './api/api';

// Session persistence helpers
const SESSION_KEY = 'studentsquare_user';

function saveSession(user: AuthUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function loadSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export default function App() {
  const saved = loadSession();
  const [isAuthenticated, setIsAuthenticated] = useState(!!saved);
  const [authUser, setAuthUser] = useState<AuthUser | null>(saved);
  const [currentPage, setCurrentPage] = useState<'home' | 'yearbook' | 'noticeboard' | 'profile' | 'squarelife'>('home');
  const [homePosts, setHomePosts] = useState<PostType[]>([]);
  const [yearbookPosts, setYearbookPosts] = useState<PostType[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<{ id: string; name: string; username: string; avatar: string }[]>([]);
  const [userProfile, setUserProfile] = useState<ApiUserProfile | null>(null);
  const [viewingProfile, setViewingProfile] = useState<ApiUserProfile | null>(null);
  const [viewingPosts, setViewingPosts] = useState<PostType[]>([]);
  const [viewingIsFollowing, setViewingIsFollowing] = useState(false);
  const [videoCallTarget, setVideoCallTarget] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (user: AuthUser) => {
    setAuthUser(user);
    setIsAuthenticated(true);
    saveSession(user);
  };

  const handleLogout = () => {
    setAuthUser(null);
    setIsAuthenticated(false);
    clearSession();
    setHomePosts([]);
    setYearbookPosts([]);
    setConversations([]);
    setNotices([]);
    setSuggestedUsers([]);
    setUserProfile(null);
  };

  // Load all data from API on authentication
  const loadData = useCallback(async () => {
    if (!authUser) return;
    setIsLoading(true);
    try {
      const [homePostsData, yearbookPostsData, noticesData, suggestedData, profileData, conversationsData] = await Promise.all([
        fetchPosts(authUser.id, undefined, 'following'),
        fetchPosts(authUser.id, undefined, 'all'),
        fetchNotices(),
        fetchSuggestedUsers(authUser.id),
        fetchProfile(authUser.id),
        fetchConversations(authUser.id),
      ]);

      setHomePosts(homePostsData);
      setYearbookPosts(yearbookPostsData);
      const allPosts = [...homePostsData, ...yearbookPostsData];
      setLikedPosts(new Set(allPosts.filter((p) => p.isLiked).map((p) => p.id)));
      setNotices(noticesData);
      setSuggestedUsers(suggestedData);
      setUserProfile(profileData);
      setConversations(conversationsData);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
    setIsLoading(false);
  }, [authUser]);

  const loadConversations = useCallback(async () => {
    if (!authUser) return;
    try {
      const convData = await fetchConversations(authUser.id);
      setConversations(convData);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, [authUser]);

  useEffect(() => {
    if (isAuthenticated && authUser) {
      loadData();
    }
  }, [isAuthenticated, authUser, loadData]);

  // Update currentUser based on logged in user profile
  const currentUser = {
    name: userProfile?.fullName || authUser?.fullName || 'yourname',
    username: userProfile?.username || authUser?.username || 'yourname',
    avatar: userProfile?.avatarUrl || '/avatar.jpg',
    bio: userProfile?.bio || '',
    location: userProfile?.location || '',
    website: userProfile?.website || '',
  };

  const handleUserClick = async (username: string) => {
    if (username === currentUser.username) {
      setViewingProfile(null);
      setCurrentPage('profile');
      return;
    }
    
    setIsLoading(true);
    setCurrentPage('profile');
    try {
      const profile = await fetchUserByUsername(username);
      setViewingProfile(profile);
      if (authUser) {
        const [userPosts, followStatus] = await Promise.all([
          fetchPosts(authUser.id, profile.id),
          fetchFollowStatus(authUser.id, profile.id)
        ]);
        setViewingPosts(userPosts);
        setViewingIsFollowing(followStatus.isFollowing);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
    setIsLoading(false);
  };

  const handleOpenMessagesWithUser = async (username: string) => {
    let currentConvs = conversations;
    if (currentConvs.length === 0 && authUser) {
      try {
        currentConvs = await fetchConversations(authUser.id);
        setConversations(currentConvs);
      } catch (err) {
        console.error('Failed to fetch convos', err);
      }
    }
    
    let conv = currentConvs.find(c => c.user.username === username);
    if (!conv) {
      // Need to create a local placeholder conversation
      const profileInfo = viewingProfile?.username === username ? viewingProfile : await fetchUserByUsername(username);
      if (profileInfo) {
        const newConv = {
          id: `conv_${profileInfo.id}`,
          user: {
            name: profileInfo.fullName,
            username: profileInfo.username,
            avatar: profileInfo.avatarUrl || '/avatar.jpg',
            isOnline: true,
          },
          messages: [],
          lastMessage: '',
          timestamp: 'Just now',
          unread: false
        };
        setConversations(prev => [newConv, ...prev]);
        conv = newConv;
      }
    }
    
    if (conv) {
      setActiveConversationId(conv.id);
    }
    setShowMessages(true);
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginSignupPage onAuthenticated={handleLogin} />;
  }

  const handleLike = async (postId: string) => {
    if (!authUser) return;
    try {
      const result = await apiToggleLike(postId, authUser.id);
      setLikedPosts((prev) => {
        const newLiked = new Set(prev);
        if (result.liked) {
          newLiked.add(postId);
        } else {
          newLiked.delete(postId);
        }
        return newLiked;
      });
      
      const updatePostLikes = (prevPosts: PostType[]) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, likes: result.likeCount } : post
        );
        
      setHomePosts(updatePostLikes);
      setYearbookPosts(updatePostLikes);
      setViewingPosts(updatePostLikes);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleComment = async (postId: string, commentText: string) => {
    if (!authUser) return;
    try {
      const comment = await apiAddComment(postId, authUser.id, commentText);
      const updatePostComments = (prevPosts: PostType[]) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, comments: [...post.comments, comment] } : post
        );
        
      setHomePosts(updatePostComments);
      setYearbookPosts(updatePostComments);
      setViewingPosts(updatePostComments);
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleCreatePost = async (caption: string, imageUrl?: string) => {
    if (!authUser) return;
    try {
      const newPost = await apiCreatePost(authUser.id, caption, imageUrl);
      setHomePosts((prev) => [newPost, ...prev]);
      setYearbookPosts((prev) => [newPost, ...prev]);
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const handleSendMessage = async (conversationId: string, messageText: string) => {
    if (!authUser) return;

    // Find the conversation to get the receiver username
    const conv = conversations.find((c) => c.id === conversationId);
    if (!conv) return;

    try {
      const message = await apiSendMessage(authUser.id, conv.user.username, messageText);

      setConversations((convs) =>
        convs.map((c) =>
          c.id === conversationId
            ? {
              ...c,
              messages: [...c.messages, message],
              lastMessage: messageText,
              timestamp: 'Just now',
            }
            : c
        )
      );
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleUpdateProfile = async (updates: {
    fullName?: string;
    bio?: string;
    avatarUrl?: string;
    location?: string;
    website?: string;
  }) => {
    if (!authUser) return;
    try {
      const updated = await apiUpdateProfile(authUser.id, updates);
      setUserProfile(updated);
      // Also update the cached auth user name if it changed
      if (updates.fullName) {
        const updatedAuth = { ...authUser, fullName: updates.fullName };
        setAuthUser(updatedAuth);
        saveSession(updatedAuth);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleToggleFollow = async (targetId: number) => {
    if (!authUser || !viewingProfile) return;
    try {
      const result = await apiToggleFollow(authUser.id, targetId);
      setViewingIsFollowing(result.isFollowing);
      
      setViewingProfile(prev => prev ? {
        ...prev,
        followers: Math.max(0, (prev.followers || 0) + (result.isFollowing ? 1 : -1))
      } : null);
      
      // Reload home feed to include/exclude the newly followed/unfollowed user's posts
      if (result.isFollowing) {
        const [homePostsData, suggestedData] = await Promise.all([
          fetchPosts(authUser.id, undefined, 'following'),
          fetchSuggestedUsers(authUser.id)
        ]);
        setHomePosts(homePostsData);
        setSuggestedUsers(suggestedData);
      } else {
        setHomePosts(prev => prev.filter(post => post.user.username !== viewingProfile.username && post.user.username !== authUser.username));
        // Alternatively reload full home feed
        const [homePostsData, suggestedData] = await Promise.all([
          fetchPosts(authUser.id, undefined, 'following'),
          fetchSuggestedUsers(authUser.id)
        ]);
        setHomePosts(homePostsData);
        setSuggestedUsers(suggestedData);
      }
    } catch (err) {
      console.error('Failed to toggle follow status:', err);
    }
  };

  if (showMessages) {
    // Load conversations when opening messages
    if (conversations.length === 0) {
      loadConversations();
    }
    return (
      <>
        <MessagesPage
          conversations={conversations}
          currentUserId="you"
          onBack={() => setShowMessages(false)}
          onSendMessage={handleSendMessage}
          onVideoCall={(username) => setVideoCallTarget(username)}
          selectedConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
        />
        <VideoCallModal 
          isOpen={!!videoCallTarget} 
          onClose={() => setVideoCallTarget(null)} 
          targetUsername={videoCallTarget || ''} 
        />
      </>
    );
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: 'tween' as const,
    ease: 'anticipate' as const,
    duration: 0.3
  };

  const renderPage = () => {
    if (isLoading && homePosts.length === 0 && yearbookPosts.length === 0) {
      return (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center pt-40"
        >
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-medium">Loading your feed...</p>
          </div>
        </motion.div>
      );
    }

    switch (currentPage) {
      case 'home':
        return (
          <motion.div
            key="home"
            initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
            className="max-w-6xl mx-auto pt-20 px-4 lg:pr-96"
          >
            <div className="max-w-[470px] mx-auto lg:mx-0">
              {homePosts.map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onComment={handleComment}
                  isLiked={likedPosts.has(post.id)}
                  onUserClick={handleUserClick}
                />
              ))}
              {homePosts.length === 0 && !isLoading && (
                <div className="text-center py-20 bg-white rounded-2xl ring-1 ring-slate-200 mt-6 shadow-sm">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Welcome to your Feed!</h3>
                  <p className="text-slate-500 font-medium px-6 mb-6">You aren't following anyone yet. Discover people in the sidebar or check out the Yearbook to see what everyone is posting!</p>
                  <button onClick={() => setCurrentPage('yearbook')} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">Go to Yearbook</button>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 'yearbook':
        return (
          <motion.div key="yearbook" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <YearbookPage
              posts={yearbookPosts}
              onLike={handleLike}
              onComment={handleComment}
              likedPosts={likedPosts}
              onUserClick={handleUserClick}
            />
          </motion.div>
        );
      case 'noticeboard':
        return (
          <motion.div key="noticeboard" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <NoticeboardPage notices={notices} />
          </motion.div>
        );
      case 'profile':
        const profileUser = viewingProfile ? {
          name: viewingProfile.fullName,
          username: viewingProfile.username,
          avatar: viewingProfile.avatarUrl || '/avatar.jpg',
          bio: viewingProfile.bio || 'Student | Tech Enthusiast | Always Learning',
          followers: viewingProfile.followers || 0,
          following: viewingProfile.following || 0,
          location: viewingProfile.location,
          website: viewingProfile.website
        } : {
          ...currentUser,
          bio: currentUser.bio || 'Student | Tech Enthusiast | Always Learning',
          followers: userProfile?.followers || 0,
          following: userProfile?.following || 0,
        };
        
        return (
          <motion.div key="profile" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <ProfilePage
              user={profileUser}
              posts={viewingProfile ? viewingPosts : homePosts}
              isOwnProfile={!viewingProfile}
              isFollowing={viewingIsFollowing}
              onBack={() => {
                setViewingProfile(null);
                setCurrentPage('home');
              }}
              onUpdateProfile={!viewingProfile ? handleUpdateProfile : undefined}
              onLogout={!viewingProfile ? handleLogout : undefined}
              onMessageClick={viewingProfile ? () => handleOpenMessagesWithUser(profileUser.username) : undefined}
              onToggleFollow={viewingProfile ? () => handleToggleFollow(viewingProfile.id) : undefined}
            />
          </motion.div>
        );
      case 'squarelife':
        return (
          <motion.div key="squarelife" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <SquareLifePage />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        onCreatePost={() => setIsCreateModalOpen(true)}
        onOpenMessages={() => {
          loadConversations();
          setShowMessages(true);
        }}
        onNavigate={(page) => setCurrentPage(page)}
        currentPage={currentPage}
        currentUserAvatar={currentUser.avatar}
      />

      <AnimatePresence mode="wait">
        {renderPage()}
      </AnimatePresence>

      {/* Sidebar - only show on home page */}
      {currentPage === 'home' && (
        <Sidebar 
          currentUser={currentUser} 
          suggestedUsers={suggestedUsers} 
          onUserClick={handleUserClick}
        />
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
        currentUserAvatar={currentUser.avatar}
        currentUserName={currentUser.username}
      />

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around h-14">
          <button
            onClick={() => setCurrentPage('home')}
            className={currentPage === 'home' ? 'text-gray-900' : 'text-gray-700'}
          >
            <Home size={24} fill={currentPage === 'home' ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => setCurrentPage('yearbook')}
            className={currentPage === 'yearbook' ? 'text-gray-900' : 'text-gray-700'}
          >
            <BookOpen size={24} />
          </button>
          <button
            onClick={() => setCurrentPage('squarelife')}
            className={currentPage === 'squarelife' ? 'text-gray-900' : 'text-gray-700'}
          >
            <Users size={24} />
          </button>
          <button
            onClick={() => setCurrentPage('noticeboard')}
            className={currentPage === 'noticeboard' ? 'text-gray-900' : 'text-gray-700'}
          >
            <Bell size={24} />
          </button>
          <button
            onClick={() => setCurrentPage('profile')}
            className={currentPage === 'profile' ? 'text-gray-900' : 'text-gray-700'}
          >
            <User size={24} />
          </button>
        </div>
      </div>

      {/* Video Call Modal */}
      <VideoCallModal 
        isOpen={!!videoCallTarget} 
        onClose={() => setVideoCallTarget(null)} 
        targetUsername={videoCallTarget || ''} 
      />
    </div>
  );
}