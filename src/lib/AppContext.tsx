'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, College, CollegeReview, Post, Community, Comment } from '@/types';
import { INITIAL_USERS, INITIAL_COLLEGES, INITIAL_REVIEWS, INITIAL_POSTS, INITIAL_COMMUNITIES } from './mockData';

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  switchRole: (role: UserRole) => void;
  allUsers: UserProfile[];
  colleges: College[];
  reviews: CollegeReview[];
  posts: Post[];
  communities: Community[];
  savedCollegeIds: string[];
  toggleSaveCollege: (collegeId: string) => void;
  addReview: (review: Omit<CollegeReview, 'id' | 'createdAt'>) => void;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'likesCount' | 'comments' | 'commentsCount' | 'sharesCount' | 'moderationStatus'>) => void;
  toggleLikePost: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  toggleFollowUser: (targetUserId: string) => void;
  addInstitutionReply: (reviewId: string, replyText: string) => void;
  getUserByUsername: (username: string) => UserProfile | undefined;
  getUserById: (id: string) => UserProfile | undefined;
  updateProfile: (updatedData: Partial<UserProfile>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [allUsers, setAllUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]); // Arun Prakash by default
  const [colleges] = useState<College[]>(INITIAL_COLLEGES);
  const [reviews, setReviews] = useState<CollegeReview[]>(INITIAL_REVIEWS);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [communities] = useState<Community[]>(INITIAL_COMMUNITIES);
  const [savedCollegeIds, setSavedCollegeIds] = useState<string[]>(['col-psg']);

  // Load from localStorage if present
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('campus_lenz_user');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));

      const savedCols = localStorage.getItem('campus_lenz_saved');
      if (savedCols) setSavedCollegeIds(JSON.parse(savedCols));
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, []);

  const switchRole = (role: UserRole) => {
    const matching = allUsers.find(u => u.role === role);
    if (matching) {
      setCurrentUser(matching);
      try {
        localStorage.setItem('campus_lenz_user', JSON.stringify(matching));
      } catch {}
    } else {
      // Create a temporary persona for institution/admin
      const tempUser: UserProfile = {
        id: `user-${role}-test`,
        username: `${role}_portal`,
        email: `${role}@campuslenz.org`,
        role,
        fullName: role === 'institution' ? 'PSG Tech Administration' : 'Platform Trust Administrator',
        headline: role === 'institution' ? 'Official Campus Administration Representative' : 'Campus Lenz Trust & Safety Lead',
        collegeId: 'col-psg',
        collegeName: 'PSG College of Technology',
        isVerified: true,
        followersCount: 520,
        followingCount: 12,
        followers: [],
        following: [],
        createdAt: new Date().toISOString()
      };
      setCurrentUser(tempUser);
    }
  };

  const toggleSaveCollege = (collegeId: string) => {
    setSavedCollegeIds(prev => {
      const next = prev.includes(collegeId)
        ? prev.filter(id => id !== collegeId)
        : [...prev, collegeId];
      try {
        localStorage.setItem('campus_lenz_saved', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const addReview = (newRev: Omit<CollegeReview, 'id' | 'createdAt'>) => {
    const fullReview: CollegeReview = {
      ...newRev,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setReviews(prev => [fullReview, ...prev]);
  };

  const addPost = (newPost: Omit<Post, 'id' | 'createdAt' | 'likes' | 'likesCount' | 'comments' | 'commentsCount' | 'sharesCount' | 'moderationStatus'>) => {
    const post: Post = {
      ...newPost,
      id: `post-${Date.now()}`,
      likes: [],
      likesCount: 0,
      comments: [],
      commentsCount: 0,
      sharesCount: 0,
      createdAt: new Date().toISOString(),
      moderationStatus: 'normal'
    };
    setPosts(prev => [post, ...prev]);
  };

  const toggleLikePost = (postId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        const alreadyLiked = p.likes.includes(currentUser.id);
        const updatedLikes = alreadyLiked
          ? p.likes.filter(id => id !== currentUser.id)
          : [...p.likes, currentUser.id];
        return {
          ...p,
          likes: updatedLikes,
          likesCount: updatedLikes.length
        };
      })
    );
  };

  const addComment = (postId: string, content: string) => {
    if (!content.trim()) return;
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      postId,
      authorId: currentUser.id,
      authorUsername: currentUser.username,
      authorName: currentUser.fullName,
      authorRole: currentUser.role,
      authorHeadline: currentUser.headline,
      isVerifiedAuthor: currentUser.isVerified,
      content,
      createdAt: new Date().toISOString(),
      likesCount: 0
    };

    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: [...p.comments, newComment],
          commentsCount: p.commentsCount + 1
        };
      })
    );
  };

  const toggleFollowUser = (targetUserId: string) => {
    if (targetUserId === currentUser.id) return;

    setAllUsers(prev =>
      prev.map(u => {
        if (u.id === targetUserId) {
          const isFollowing = u.followers.includes(currentUser.id);
          const nextFollowers = isFollowing
            ? u.followers.filter(id => id !== currentUser.id)
            : [...u.followers, currentUser.id];
          return {
            ...u,
            followers: nextFollowers,
            followersCount: nextFollowers.length
          };
        }
        if (u.id === currentUser.id) {
          const isFollowing = u.following.includes(targetUserId);
          const nextFollowing = isFollowing
            ? u.following.filter(id => id !== targetUserId)
            : [...u.following, targetUserId];
          return {
            ...u,
            following: nextFollowing,
            followingCount: nextFollowing.length
          };
        }
        return u;
      })
    );

    // Also update active currentUser object state
    setCurrentUser(prev => {
      const isFollowing = prev.following.includes(targetUserId);
      const nextFollowing = isFollowing
        ? prev.following.filter(id => id !== targetUserId)
        : [...prev.following, targetUserId];
      return {
        ...prev,
        following: nextFollowing,
        followingCount: nextFollowing.length
      };
    });
  };

  const addInstitutionReply = (reviewId: string, replyText: string) => {
    setReviews(prev =>
      prev.map(r => {
        if (r.id === reviewId) {
          return {
            ...r,
            institutionReply: {
              text: replyText,
              repliedAt: new Date().toISOString(),
              officialName: currentUser?.fullName || 'Verified College Representative'
            }
          };
        }
        return r;
      })
    );
  };

  const getUserByUsername = (username: string) => {
    return allUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
  };

  const getUserById = (id: string) => {
    return allUsers.find(u => u.id === id);
  };

  const updateProfile = (updatedData: Partial<UserProfile>) => {
    const updatedUser = { ...currentUser, ...updatedData };
    setCurrentUser(updatedUser);
    
    // Also update in allUsers array so changes appear across the whole system
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updatedData } : u));
    
    // Also update authorName/authorHeadline on existing posts authored by this user
    if (updatedData.fullName || updatedData.headline) {
      setPosts(prev => prev.map(p => {
        if (p.authorId === currentUser.id) {
          return {
            ...p,
            authorName: updatedData.fullName || p.authorName,
            authorHeadline: updatedData.headline || p.authorHeadline
          };
        }
        return p;
      }));
    }

    try {
      localStorage.setItem('campus_lenz_user', JSON.stringify(updatedUser));
    } catch {}
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        allUsers,
        colleges,
        reviews,
        posts,
        communities,
        savedCollegeIds,
        toggleSaveCollege,
        addReview,
        addPost,
        toggleLikePost,
        addComment,
        toggleFollowUser,
        addInstitutionReply,
        getUserByUsername,
        getUserById,
        updateProfile
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
