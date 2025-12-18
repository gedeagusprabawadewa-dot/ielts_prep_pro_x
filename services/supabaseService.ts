
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Submission, User } from '../types';

// Production Credentials
const SUPABASE_URL = 'https://vmhagbqamdewmxczvorq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtaGFnYnFhbWRld214Y3p2b3JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNDU2MjcsImV4cCI6MjA4MTYyMTYyN30.HrkpAM626h-MdnIpqPd7ODlzAATwv--o8iHtRbuSVr4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Health check
console.log('IELTS Prep Pro: Cloud Service Initialized');

export const saveSubmissionToCloud = async (submission: Submission, userId: string) => {
  if (!supabase) return;
  const { error } = await supabase
    .from('submissions')
    .insert([{ 
      ...submission, 
      user_id: userId 
    }]);
  if (error) {
    console.error('Supabase save error:', error.message);
    throw error;
  }
};

export const fetchSubmissionsFromCloud = async (userId: string): Promise<Submission[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('user_id', userId)
    .order('createdAt', { ascending: false });
  if (error) {
    console.warn('Supabase fetch error:', error.message);
    return [];
  }
  return data || [];
};

export const updateProfileInCloud = async (userId: string, updates: Partial<User>) => {
  if (!supabase) return;
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      ...updates,
      updated_at: new Date().toISOString()
    });
  if (error) {
    console.error('Supabase profile update error:', error.message);
    throw error;
  }
};

export const getProfileFromCloud = async (userId: string): Promise<Partial<User> | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
};
