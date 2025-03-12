import { supabase } from './supabase';
import { Session, User } from '@supabase/supabase-js';
import { User as AppUser } from '../types/supabase';

export interface SignInCredentials {
  email: string;
  password: string;
}

export const signIn = async ({ email, password }: SignInCredentials) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data } = await supabase.auth.getUser();
  return data.user;
};

export const getCurrentSession = async (): Promise<Session | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

export const onAuthStateChange = (callback: (session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange((_, session) => {
    callback(session);
  });
};

export const getUserProfile = async (userId: string): Promise<AppUser | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }

  return data;
};

export const updateUserProfile = async (userId: string, profile: Partial<AppUser>): Promise<AppUser> => {
  const { data, error } = await supabase
    .from('users')
    .update(profile)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }

  return data;
};

export const uploadProfileImage = async (userId: string, imageFile: File): Promise<string> => {
  const fileExt = imageFile.name.split('.').pop();
  const fileName = `${userId}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('profile_images')
    .upload(filePath, imageFile, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Error uploading profile image:', uploadError);
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from('profile_images')
    .getPublicUrl(filePath);

  const imageUrl = publicUrlData.publicUrl;

  // Update user profile with new image URL
  await updateUserProfile(userId, { profile_image_url: imageUrl });

  return imageUrl;
}; 