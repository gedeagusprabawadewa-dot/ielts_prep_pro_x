
import { Submission, User, AuthMode } from '../types';
import { saveSubmissionToCloud, fetchSubmissionsFromCloud, updateProfileInCloud } from './supabaseService';

const SUBMISSIONS_KEY = 'ielts_prep_submissions';
const USER_KEY = 'ielts_prep_user';
const DRAFT_PREFIX = 'ielts_draft_';

export const saveSubmission = async (submission: Submission) => {
  const user = getSessionUser();
  
  // Always save locally for offline support and instant UI updates
  const submissions = getSubmissions();
  submissions.unshift(submission);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));

  // If logged in via Supabase, sync to cloud
  if (user?.authMode === 'supabase' && user.id) {
    try {
      await saveSubmissionToCloud(submission, user.id);
    } catch (e) {
      console.error("Cloud sync failed, data remains saved locally.", e);
    }
  }
};

export const getSubmissions = (): Submission[] => {
  const data = localStorage.getItem(SUBMISSIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const syncLocalDataToCloud = async (userId: string) => {
  const localSubmissions = getSubmissions();
  if (localSubmissions.length === 0) return;

  // Sync each local submission that might not be in the cloud
  // In a production app, we'd check for duplicates, but for MVP we upload the batch
  for (const sub of localSubmissions) {
    try {
      await saveSubmissionToCloud(sub, userId);
    } catch (e) {
      console.warn("Individual sync failed", e);
    }
  }
};

export const getSessionUser = (): User | null => {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const updateUserData = async (updates: Partial<User>) => {
  const user = getSessionUser();
  if (!user) return;
  const updatedUser = { ...user, ...updates };
  localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

  if (user.authMode === 'supabase' && user.id) {
    try {
      await updateProfileInCloud(user.id, updates);
    } catch (e) {
      console.error("Cloud profile update failed", e);
    }
  }
  return updatedUser;
};

export const loginUserLocal = (email: string) => {
  const user: User = { 
    id: 'local_' + Math.random().toString(36).substr(2, 9), 
    email,
    targetBand: 7.0,
    theme: 'light',
    accentColor: 'blue',
    authMode: 'trial'
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const loginUserCloud = (id: string, email: string, profile: Partial<User> | null) => {
  const user: User = {
    id,
    email,
    targetBand: profile?.targetBand || 7.0,
    theme: profile?.theme || 'light',
    accentColor: profile?.accentColor || 'blue',
    authMode: 'supabase'
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const logoutUser = () => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(SUBMISSIONS_KEY); 
};

export const saveDraft = (taskId: string, content: string) => {
  localStorage.setItem(`${DRAFT_PREFIX}${taskId}`, content);
};

export const getDraft = (taskId: string): string | null => {
  return localStorage.getItem(`${DRAFT_PREFIX}${taskId}`);
};

export const clearDraft = (taskId: string) => {
  localStorage.removeItem(`${DRAFT_PREFIX}${taskId}`);
};
