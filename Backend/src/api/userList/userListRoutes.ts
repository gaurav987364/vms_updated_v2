import { Router } from "express";
import {
  deleteUser,
  getUserById,
  getUsersList,
  updateUser,
} from "./userListController";
import { authenticateJWT } from "../../services/passportJwt.service";

/**
 * User List Routes
 * ------------------------------------------------------
 * Routes for user list CRUD operations
 * Note: CREATE route is in auth/authRoutes.ts (POST /auth/register)
 */

const userListRoute = Router();

// All routes require authentication
userListRoute.use(authenticateJWT);

/**
 * GET /api/users
 * Get list of users with pagination, search, and filters
 * Query params:
 * - page: number (default: 1)
 * - perPage: number (default: 10)
 * - search: string (searches name, username, email)
 * - sortBy: string (name, email, username, userType, createdAt)
 * - userType: "user" | "supplier"
 */
userListRoute.get("/", getUsersList);

/**
 * GET /api/users/:id
 * Get single user by ID
 */
userListRoute.get("/:id", getUserById);

/**
 * PUT /api/users/:id
 * Update user by ID
 * Body: updateUserSchema (all fields optional)
 */
userListRoute.put("/:id", updateUser);

/**
 * DELETE /api/users/:id
 * Delete user by ID
 */
userListRoute.delete("/:id", deleteUser);

export default userListRoute;
