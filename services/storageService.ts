
import { Submission, User, AppTheme, AccentColor } from '../types';

const SUBMISSIONS_KEY = 'ielts_prep_submissions';
const USER_KEY = 'ielts_prep_user';
const DRAFT_PREFIX = 'ielts_draft_';

export const saveSubmission = (submission: Submission) => {
  const submissions = getSubmissions();
  submissions.unshift(submission);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
};

export const getSubmissions = (): Submission[] => {
  const data = localStorage.getItem(SUBMISSIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getSessionUser = (): User | null => {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const updateUserData = (updates: Partial<User>) => {
  const user = getSessionUser();
  if (!user) return;
  const updatedUser = { ...user, ...updates };
  localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  return updatedUser;
};

export const loginUser = (email: string) => {
  const user: User = { 
    id: Math.random().toString(36).substr(2, 9), 
    email,
    targetBand: 7.0,
    theme: 'light',
    accentColor: 'blue'
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const logoutUser = () => {
  localStorage.removeItem(USER_KEY);
};

// Draft Management
export const saveDraft = (taskId: string, content: string) => {
  localStorage.setItem(`${DRAFT_PREFIX}${taskId}`, content);
};

export const getDraft = (taskId: string): string | null => {
  return localStorage.getItem(`${DRAFT_PREFIX}${taskId}`);
};

export const clearDraft = (taskId: string) => {
  localStorage.removeItem(`${DRAFT_PREFIX}${taskId}`);
};
