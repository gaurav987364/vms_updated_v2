import axiosInstance from "./axiosInstance";

export interface UpdateProfileData {
  name?: string;
  username?: string;
  email?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UserResponse {
  _id: string;
  name: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Update user profile
 */
export const updateUserProfile = async (data: UpdateProfileData): Promise<UserResponse> => {
  try {
    const response = await axiosInstance.put("/auth/profile", data);
    return response.data.user;
  } catch (error: any) {
    console.error("Error updating profile:", error.message);
    throw new Error(error.response?.data?.message || "Failed to update profile");
  }
};

/**
 * Change user password
 */
export const changeUserPassword = async (data: ChangePasswordData): Promise<void> => {
  try {
    await axiosInstance.put("/auth/password/change", data);
  } catch (error: any) {
    console.error("Error changing password:", error.message);
    throw new Error(error.response?.data?.message || "Failed to change password");
  }
};
