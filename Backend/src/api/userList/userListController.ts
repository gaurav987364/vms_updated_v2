import { Request, Response } from "express";
import { HTTPSSTATUS } from "../../config/http.config";
import { asyncHandler } from "../../middlewares/asyncHandler";
import {
  listQuerySchema,
  mongoIdSchema,
  updateUserSchema,
} from "./userListValidators";
import {
  DeleteUserService,
  GetUserByIdService,
  GetUsersListService,
  UpdateUserService,
} from "./userListService";

/**
 * User List Controller
 * ------------------------------------------------------
 * Handlers for user list operations (GET, UPDATE, DELETE)
 * Note: CREATE is handled by auth/authController registerUser
 */

/**
 * GET /api/users
 * Get list of users with pagination, search, and filters
 */
export const getUsersList = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    // Validate and parse query params
    const queryParams = listQuerySchema.parse({
      page: req.query.page,
      perPage: req.query.perPage,
      search: req.query.search,
      sortBy: req.query.sortBy,
      userType: req.query.userType,
    });

    const result = await GetUsersListService(queryParams);

    return res.status(HTTPSSTATUS.OK).json(result);
  }
);

/**
 * GET /api/users/:id
 * Get single user by ID
 */
export const getUserById = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const userId = mongoIdSchema.parse(req.params.id);

    const user = await GetUserByIdService(userId);

    return res.status(HTTPSSTATUS.OK).json({
      user,
    });
  }
);

/**
 * PUT /api/users/:id
 * Update user by ID
 */
export const updateUser = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const userId = mongoIdSchema.parse(req.params.id);
    const updateData = updateUserSchema.parse(req.body);

    const updatedUser = await UpdateUserService(userId, updateData);

    return res.status(HTTPSSTATUS.OK).json({
      message: "User updated successfully.",
      user: updatedUser,
    });
  }
);

/**
 * DELETE /api/users/:id
 * Delete user by ID
 */
export const deleteUser = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    console.log("🗑️ DELETE request received for user:", req.params.id);
    console.log("Authorization header:", req.headers.authorization);
    console.log("Cookies:", req.cookies);

    const userId = mongoIdSchema.parse(req.params.id);

    const result = await DeleteUserService(userId);

    console.log("✅ User deleted successfully:", userId);

    return res.status(HTTPSSTATUS.OK).json(result);
  }
);
