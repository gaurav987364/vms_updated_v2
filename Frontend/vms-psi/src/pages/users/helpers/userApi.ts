/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/services/api/axiosInstance";
import type { CreateUserInput, UpdateUserInput, UserListItem } from "@/shared/schemas/userSchema";

/**
 * User API Helper with TanStack Query
 * ------------------------------------------------------
 * Centralized API calls + React Query hooks for user management
 * All error/success handling done here - no need in components
 */

export interface GetUsersParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  userType?: "user" | "supplier";
}

export interface GetUsersResponse {
  results: UserListItem[];
  total: number;
  page: number;
  pages: number;
  perPage: number;
}

// ============================================
// API FUNCTIONS (Raw axios calls)
// ============================================

/**
 * Get list of users with pagination and filters
 */
const getUsersApi = async (params: GetUsersParams): Promise<GetUsersResponse> => {
  const response = await axiosInstance.get("/users", { params });
  return response.data;
};

/**
 * Get single user by ID
 */
const getUserByIdApi = async (userId: string): Promise<UserListItem> => {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data.user;
};

/**
 * Create new user (uses auth register endpoint)
 */
const createUserApi = async (userData: CreateUserInput) => {
  const response = await axiosInstance.post("/auth/register", userData);
  return response.data;
};

/**
 * Update user by ID
 */
const updateUserApi = async ({ userId, userData }: { userId: string; userData: Partial<UpdateUserInput> }) => {
  const response = await axiosInstance.put(`/users/${userId}`, userData);
  return response.data;
};

/**
 * Delete user by ID
 */
const deleteUserApi = async (userId: string) => {
  const response = await axiosInstance.delete(`/users/${userId}`);
  return response.data;
};

// ============================================
// REACT QUERY HOOKS (Use in components)
// ============================================

/**
 * Hook: Fetch users list with pagination/filters
 * Auto-refetches when params change
 */
export const useUsers = (params: GetUsersParams, showAlert?: (alert: any) => void) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => getUsersApi(params),
    //@ts-ignore
    onError: (error: any) => {
      console.error("Error fetching users:", error);
      showAlert?.({
        type: "error",
        title: "Failed to Fetch Users",
        description: error.response?.data?.message || "Unable to load users. Please try again.",
      });
    },
  });
};

/**
 * Hook: Fetch single user by ID
 */
export const useUser = (userId: string | null, showAlert?: (alert: any) => void) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserByIdApi(userId!),
    enabled: !!userId, // Only fetch if userId exists
    //@ts-ignore
    onError: (error: any) => {
      console.error("Error fetching user:", error);
      showAlert?.({
        type: "error",
        title: "Failed to Load User",
        description: error.response?.data?.message || "Unable to fetch user data. Please try again.",
      });
    },
  });
};

/**
 * Hook: Create new user
 * Auto-invalidates users list on success
 */
export const useCreateUser = (showAlert?: (alert: any) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserApi,
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ["users"] });

      showAlert?.({
        type: "success",
        title: "User Created",
        description: "New user has been successfully added to the system.",
      });
    },
    onError: (error: any) => {
      console.error("Error creating user:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to create user. Please try again.";

      showAlert?.({
        type: "error",
        title: "Creation Failed",
        description: errorMessage,
      });
    },
  });
};

/**
 * Hook: Update existing user
 * Auto-invalidates users list and user detail on success
 */
export const useUpdateUser = (showAlert?: (alert: any) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserApi,
    onSuccess: (_, variables) => {
      // Invalidate both list and detail
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });

      showAlert?.({
        type: "success",
        title: "User Updated",
        description: "User information has been successfully updated.",
      });
    },
    onError: (error: any) => {
      console.error("Error updating user:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to update user. Please try again.";

      showAlert?.({
        type: "error",
        title: "Update Failed",
        description: errorMessage,
      });
    },
  });
};

/**
 * Hook: Delete user
 * Auto-invalidates users list on success
 */
export const useDeleteUser = (showAlert?: (alert: any) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserApi,
    onSuccess: () => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: ["users"] });

      showAlert?.({
        type: "success",
        title: "User Deleted",
        description: "User has been successfully removed from the system.",
      });
    },
    onError: (error: any) => {
      console.error("Error deleting user:", error);
      const errorMessage = error.response?.data?.message || error.message || "Unable to delete user. Please try again.";

      showAlert?.({
        type: "error",
        title: "Delete Failed",
        description: errorMessage,
      });
    },
  });
};
