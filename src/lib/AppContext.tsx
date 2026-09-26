'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, College, CollegeReview, Post, Community } from '@/types';
import { DEFAULT_USER, INITIAL_COLLEGES, INITIAL_REVIEWS, INITIAL_POSTS, INITIAL_COMMUNITIES } from './mockData';

interface AppContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  switchRole: (role: UserRole) => void;
  colleges: College[];
  reviews: CollegeReview[];
  posts: Post[];
  communities: Community[];
  savedCollegeIds: string[];
  toggleSaveCollege: (collegeId: string) => void;
  addReview: (review: Omit<CollegeReview, 'id' | 'createdAt'>) => void;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'sharesCount' | 'moderationStatus'>) => void;
  toggleLikePost: (postId: string) => void;
  addInstitutionReply: (reviewId: string, replyText: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(DEFAULT_USER);
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
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      role,
      fullName:
        role === 'alumni'
          ? 'Karthik Raja (Alumni)'
          : role === 'institution'
          ? 'PSG Tech Administration'
          : role === 'admin'
          ? 'Platform Trust Administrator'
          : 'Arun Prakash (Student)',
      isVerified: role === 'alumni' || role === 'institution' || role === 'admin'
    };
    setCurrentUser(updated);
    try {
      localStorage.setItem('campus_lenz_user', JSON.stringify(updated));
    } catch {}
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

  const addPost = (newPost: Omit<Post, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'sharesCount' | 'moderationStatus'>) => {
    const post: Post = {
      ...newPost,
      id: `post-${Date.now()}`,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      createdAt: new Date().toISOString(),
      moderationStatus: 'normal'
    };
    setPosts(prev => [post, ...prev]);
  };

  const toggleLikePost = (postId: string) => {
    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p))
    );
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

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        colleges,
        reviews,
        posts,
        communities,
        savedCollegeIds,
        toggleSaveCollege,
        addReview,
        addPost,
        toggleLikePost,
        addInstitutionReply
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
