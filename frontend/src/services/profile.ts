import axios from '../lib/axios';
import type { User } from '../types/auth';

export interface UpdateProfileData {
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
}

export interface ProfileResponse {
  user: User;
}

export interface UpdateProfileResponse {
  message: string;
  user: User;
}

export interface UploadAvatarResponse {
  message: string;
  avatar: string;
}

export interface DeleteAvatarResponse {
  message: string;
}

/**
 * Get the current user's profile
 */
export const getProfile = async (): Promise<User> => {
  const response = await axios.get<ProfileResponse>('/profile');
  return response.data.user;
};

/**
 * Update the current user's profile
 */
export const updateProfile = async (data: UpdateProfileData): Promise<User> => {
  const response = await axios.put<UpdateProfileResponse>('/profile', data);
  return response.data.user;
};

/**
 * Upload a new avatar for the current user
 */
export const uploadAvatar = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await axios.post<UploadAvatarResponse>('/profile/avatar', formData);

  return response.data.avatar;
};

/**
 * Delete the current user's avatar
 */
export const deleteAvatar = async (): Promise<void> => {
  await axios.delete<DeleteAvatarResponse>('/profile/avatar');
};
