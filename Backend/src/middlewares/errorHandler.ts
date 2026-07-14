import { z } from "zod";
import { ErrorRequestHandler, Response } from "express";
import { AppError } from "../utils/helper";
import { HTTPSSTATUS } from "../config/http.config";
import {
  clearAuthenticationCookies,
  REFRESH_PATH,
} from "../utils/cookies/setCookies";

const formatZodError = (res: Response, error: z.ZodError) => {
  const errors = error?.issues?.map((err) => {
    return {
      field: err.path.join(""),
      message: err.message,
    };
  });
  return res.status(HTTPSSTATUS.BAD_REQUEST).json({
    message: "Validation Error",
    errors,
  });
};
export const errorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next,
): any => {
  console.error(`Error Occured On Path : ${req.path}`, error);

  // if refresh path then clear cookies all
  if (req.path === REFRESH_PATH) {
    clearAuthenticationCookies(res);
  }

  // syntax errors for invalid json syntax
  if (error instanceof SyntaxError) {
    return res.status(HTTPSSTATUS.BAD_REQUEST).json({
      message: "Invalid, Json Syntax.",
      error: error?.message || "Unknown Error Occured.",
    });
  }

  //zod errors
  if (error instanceof z.ZodError) {
    return formatZodError(res, error);
  }

  //app error class for custom errors like happeing in request of something so return proper code + message
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      errorCode: error.errorCode,
    });
  }

  return res.status(HTTPSSTATUS.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
    error: error?.message || "Unknown Error Occured.",
  });
};
