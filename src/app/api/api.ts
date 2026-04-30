
import type { AuthUser } from "./auth";

// ─────────────────────────────────────────────
// Generic request helper
// ─────────────────────────────────────────────

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    throw new Error("Cannot reach API server. Make sure the server is running.");
  }

  const rawBody = await response.text();
  let data: any = null;
  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      if (!response.ok) throw new Error("Server returned an invalid response.");
      throw new Error("Unexpected server response.");
    }
  }

  if (!response.ok) {
    throw new Error(data?.error || "Request failed.");
  }

  if (!data) throw new Error("Server returned an empty response.");
  return data as T;
}

// ─────────────────────────────────────────────
// Posts
// ─────────────────────────────────────────────

export interface ApiPost {
  id: string;
  user: { name: string; username: string; avatar: string };
  image?: string;
  caption: string;
  likes: number;
  isLiked: boolean;
  comments: { id: string; user: string; text: string }[];
  timestamp: string;
}

export async function fetchPosts(userId: number, profileUserId?: number, feed: 'all' | 'following' = 'all'): Promise<ApiPost[]> {
  const url = profileUserId 
    ? `/api/posts?userId=${userId}&profileUserId=${profileUserId}`
    : `/api/posts?userId=${userId}&feed=${feed}`;
  const { posts } = await request<{ posts: ApiPost[] }>(url);
  return posts;
}

export async function createPost(userId: number, caption: string, imageUrl?: string): Promise<ApiPost> {
  const { post } = await request<{ post: ApiPost }>("/api/posts", {
    method: "POST",
    body: JSON.stringify({ userId, caption, imageUrl }),
  });
  return post;
}

export async function toggleLike(postId: string, userId: number): Promise<{ liked: boolean; likeCount: number }> {
  return request<{ liked: boolean; likeCount: number }>(`/api/posts/${postId}/like`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export async function addComment(postId: string, userId: number, text: string): Promise<{ id: string; user: string; text: string }> {
  const { comment } = await request<{ comment: { id: string; user: string; text: string } }>(
    `/api/posts/${postId}/comments`,
    {
      method: "POST",
      body: JSON.stringify({ userId, text }),
    }
  );
  return comment;
}

// ─────────────────────────────────────────────
// User Profile
// ─────────────────────────────────────────────

export interface ApiUserProfile {
  id: number;
  email: string;
  username: string;
  fullName: string;
  university: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  location: string;
  website: string;
  createdAt: string;
  postCount?: number;
  followers?: number;
  following?: number;
}

export async function fetchProfile(userId: number): Promise<ApiUserProfile> {
  const { user } = await request<{ user: ApiUserProfile }>(`/api/user/${userId}`);
  return user;
}

export async function fetchUserByUsername(username: string): Promise<ApiUserProfile> {
  const { user } = await request<{ user: ApiUserProfile }>(`/api/user/by-username/${username}`);
  return user;
}

export async function toggleFollow(userId: number, targetId: number): Promise<{ isFollowing: boolean }> {
  return request<{ isFollowing: boolean }>(`/api/user/${userId}/follow`, {
    method: "POST",
    body: JSON.stringify({ targetId }),
  });
}

export async function fetchFollowStatus(userId: number, targetId: number): Promise<{ isFollowing: boolean }> {
  return request<{ isFollowing: boolean }>(`/api/user/${userId}/follow-status?targetId=${targetId}`);
}

export async function updateProfile(
  userId: number,
  updates: {
    fullName?: string;
    bio?: string;
    avatarUrl?: string;
    coverUrl?: string;
    location?: string;
    website?: string;
  }
): Promise<ApiUserProfile> {
  const { user } = await request<{ user: ApiUserProfile }>(`/api/user/${userId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  return user;
}

// ─────────────────────────────────────────────
// Messages
// ─────────────────────────────────────────────

export interface ApiMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface ApiConversation {
  id: string;
  user: {
    id: number;
    name: string;
    username: string;
    avatar: string;
    isOnline: boolean;
  };
  messages: ApiMessage[];
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

export async function fetchConversations(userId: number): Promise<ApiConversation[]> {
  const { conversations } = await request<{ conversations: ApiConversation[] }>(
    `/api/messages/${userId}`
  );
  return conversations;
}

export async function sendMessage(
  senderId: number,
  receiverUsername: string,
  text: string
): Promise<ApiMessage> {
  const { message } = await request<{ message: ApiMessage }>("/api/messages", {
    method: "POST",
    body: JSON.stringify({ senderId, receiverUsername, text }),
  });
  return message;
}

// ─────────────────────────────────────────────
// Notices
// ─────────────────────────────────────────────

export interface ApiNotice {
  id: string;
  title: string;
  content: string;
  author: { name: string; type: "department" | "club" | "admin" };
  date: string;
  isPinned: boolean;
  category: string;
  location?: string;
  attendees?: number;
}

export async function fetchNotices(): Promise<ApiNotice[]> {
  const { notices } = await request<{ notices: ApiNotice[] }>("/api/notices");
  return notices;
}

// ─────────────────────────────────────────────
// Suggested Users
// ─────────────────────────────────────────────

export interface ApiSuggestedUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

export async function fetchSuggestedUsers(excludeId: number): Promise<ApiSuggestedUser[]> {
  const { users } = await request<{ users: ApiSuggestedUser[] }>(
    `/api/users/suggested?excludeId=${excludeId}`
  );
  return users;
}
