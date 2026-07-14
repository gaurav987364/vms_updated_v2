import bcrypt from "bcrypt";
import UserModel from "../auth/userModel";
import {
  BadRequestException,
  NotFoundExeption,
} from "../../utils/Errors/ErrorTypes";
import { ErrorCode } from "../../utils/constants/constant";

/**
 * User List Service
 * ------------------------------------------------------
 * Business logic for user list operations (GET, UPDATE, DELETE)
 * Note: CREATE is handled by auth/authService RegisterService
 */

interface ListUsersParams {
  page: number;
  perPage: number;
  search?: string;
  sortBy: string;
  userType?: "user" | "supplier";
}

interface ListUsersResponse {
  results: any[];
  total: number;
  page: number;
  pages: number;
  perPage: number;
}

/**
 * Get Users List with Pagination, Search, and Filters - OPTIMIZED
 */
export const GetUsersListService = async (
  params: ListUsersParams
): Promise<ListUsersResponse> => {
  const { page, perPage, search, sortBy, userType } = params;

  // Build query filter
  const filter: any = {};

  // Search by name, username, email, or supplierCode
  if (search && search.trim() !== "") {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { supplierCode: { $regex: search, $options: "i" } },
    ];
  }

  // Filter by userType
  if (userType) {
    filter.userType = userType;
  }

  // Calculate skip for pagination
  const skip = (page - 1) * perPage;

  // Determine sort field and order
  let sortOptions: any = {};
  if (sortBy === "name") {
    sortOptions = { name: 1 }; // A-Z
  } else if (sortBy === "email") {
    sortOptions = { email: 1 };
  } else if (sortBy === "username") {
    sortOptions = { username: 1 };
  } else if (sortBy === "userType") {
    sortOptions = { userType: 1 };
  } else {
    sortOptions = { createdAt: -1 }; // Default: newest first
  }

  // OPTIMIZATION: Run count and find in parallel
  const [total, users] = await Promise.all([
    UserModel.countDocuments(filter),
    UserModel.find(filter)
      .select("name email username department role plantCode userType supplierCode isPaid createdAt updatedAt")
      .sort(sortOptions)
      .skip(skip)
      .limit(perPage)
      .lean()
  ]);

  // Calculate total pages
  const pages = Math.ceil(total / perPage);

  return {
    results: users,
    total,
    page,
    pages,
    perPage,
  };
};

/**
 * Get Single User by ID
 */
export const GetUserByIdService = async (userId: string) => {
  const user = await UserModel.findById(userId).select("-password").lean();

  if (!user) {
    throw new NotFoundExeption(
      "User Not Found.",
      ErrorCode.AUTH_USER_NOT_FOUND
    );
  }

  return user;
};

/**
 * Update User by ID - OPTIMIZED FOR SPEED
 */
export const UpdateUserService = async (userId: string, updateData: any) => {
  // OPTIMIZATION: Only fetch fields we need for comparison (not entire document)
  const validationTasks: Promise<any>[] = [];

  // Only fetch user if we need to compare values
  const needsUserFetch = updateData.email || updateData.username || updateData.supplierCode;

  if (needsUserFetch) {
    validationTasks.push(
      UserModel.findById(userId)
        .select("email username supplierCode")
        .lean()
        .then(user => ({ user }))
    );
  }

  // Hash password in parallel if needed
  if (updateData.password && updateData.password.trim() !== "") {
    validationTasks.push(
      bcrypt.genSalt(10).then(salt =>
        bcrypt.hash(updateData.password, salt).then(hash => ({ hashedPassword: hash }))
      )
    );
  } else {
    delete updateData.password;
  }

  // Run user fetch and password hashing in parallel
  const results = await Promise.all(validationTasks);

  // Extract results
  let user: any = null;
  let hashedPassword: string | null = null;

  for (const result of results) {
    if (result.user) user = result.user;
    if (result.hashedPassword) hashedPassword = result.hashedPassword;
  }

  // If we needed to fetch user but didn't find it
  if (needsUserFetch && !user) {
    throw new NotFoundExeption(
      "User Not Found.",
      ErrorCode.AUTH_USER_NOT_FOUND
    );
  }

  // Apply hashed password
  if (hashedPassword) {
    updateData.password = hashedPassword;
  }

  // Build uniqueness validation checks - only for changed fields
  const uniquenessChecks: Promise<any>[] = [];

  if (user) {
    if (updateData.email && updateData.email !== user.email) {
      uniquenessChecks.push(
        UserModel.exists({ email: updateData.email, _id: { $ne: userId } }).then(exists => ({
          field: 'email',
          exists
        }))
      );
    }

    if (updateData.username && updateData.username !== user.username) {
      uniquenessChecks.push(
        UserModel.exists({ username: updateData.username, _id: { $ne: userId } }).then(exists => ({
          field: 'username',
          exists
        }))
      );
    }

    if (updateData.supplierCode && updateData.supplierCode !== user.supplierCode) {
      uniquenessChecks.push(
        UserModel.exists({ supplierCode: updateData.supplierCode, _id: { $ne: userId } }).then(exists => ({
          field: 'supplierCode',
          exists,
          value: updateData.supplierCode
        }))
      );
    }
  }

  // Run uniqueness checks in parallel
  if (uniquenessChecks.length > 0) {
    const uniquenessResults = await Promise.all(uniquenessChecks);

    for (const result of uniquenessResults) {
      if (result.exists) {
        if (result.field === 'email') {
          throw new BadRequestException(
            "Email already in use by another user.",
            ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
          );
        } else if (result.field === 'username') {
          throw new BadRequestException(
            "Username already in use by another user.",
            ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
          );
        } else if (result.field === 'supplierCode') {
          throw new BadRequestException(
            `Supplier code "${result.value}" is already in use by another user.`,
            ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
          );
        }
      }
    }
  }

  // Update user - use runValidators: false for speed since we already validated
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: false }
    ).select("name email username department role plantCode userType supplierCode isPaid createdAt updatedAt").lean();

    if (!updatedUser) {
      throw new NotFoundExeption("User Not Found.", ErrorCode.AUTH_USER_NOT_FOUND);
    }

    return updatedUser;
  } catch (error: any) {
    // Handle MongoDB duplicate key errors (race condition fallback)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      const value = error.keyValue?.[field];

      if (field === "supplierCode") {
        throw new BadRequestException(
          `Supplier code "${value}" is already in use by another user.`,
          ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
        );
      } else if (field === "email") {
        throw new BadRequestException(
          `Email "${value}" is already in use by another user.`,
          ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
        );
      } else if (field === "username") {
        throw new BadRequestException(
          `Username "${value}" is already taken.`,
          ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
        );
      } else {
        throw new BadRequestException(
          `This ${field} is already in use.`,
          ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
        );
      }
    }

    throw error;
  }
};

/**
 * Delete User by ID - OPTIMIZED
 */
export const DeleteUserService = async (userId: string) => {
  // OPTIMIZATION: Single DB call instead of two (find + delete)
  const deletedUser = await UserModel.findByIdAndDelete(userId).lean();

  if (!deletedUser) {
    throw new NotFoundExeption(
      "User Not Found.",
      ErrorCode.AUTH_USER_NOT_FOUND
    );
  }

  return {
    message: "User deleted successfully.",
  };
};
