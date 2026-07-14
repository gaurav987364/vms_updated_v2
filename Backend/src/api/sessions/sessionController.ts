import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { HTTPSSTATUS } from "../../config/http.config";
import { z } from "zod";
import { NotFoundExeption } from "../../utils/Errors/ErrorTypes";
import { DeleteSessionService, GetAllSessionService, GetCurrentSessionService, ValidateSessionService } from "./sessionService";

const getAllSessions = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const sessionId = req.sessionId;
    const userId = (req.user as any)?.id;

    const { sessions } = await GetAllSessionService(userId);
    const modifySessions = sessions.map((session) => ({
      ...session.toObject(), //convert to plain-js object taki we do below stuff
      ...(session.id === sessionId && {
        isCurrent: true, //adding proprty to object;
      }),
    }));

    return res.status(HTTPSSTATUS.OK).json({
      message: "Retrieved All Session Succesfully.",
      sessions: modifySessions,
    });
  },
);

//get current-active session
const getSession = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const sessionId = req.sessionId;

    if (!sessionId) {
      throw new NotFoundExeption("Invalid Session.");
    }

    const { user } = await GetCurrentSessionService(sessionId);
    return res.status(HTTPSSTATUS.OK).json({
      message: "Session Retrieved Successfully",
      user,
    });
  },
);

//delete session
const deleteSession = asyncHandler(async (req: Request, res: Response) => {
  const sessionId = z.string().parse(req.params.id);
  const userId = (req.user as any)?.id;

  if (!sessionId || !userId) {
    throw new NotFoundExeption("Resources Not Found.");
  }

  await DeleteSessionService(sessionId, userId);

  return res.status(HTTPSSTATUS.OK).json({
    message: "Session Deleted Successfully.",
  });
});

// validate session (for frontend polling)
const validateSession = asyncHandler(async (req: Request, res: Response) => {
  const sessionId = req.sessionId;

  if (!sessionId) {
    throw new NotFoundExeption("Session Not Found.");
  }

  const { isValid } = await ValidateSessionService(sessionId);

  return res.status(HTTPSSTATUS.OK).json({
    message: "Session Validated.",
    isValid,
  });
});

export { getAllSessions, getSession, deleteSession, validateSession };
