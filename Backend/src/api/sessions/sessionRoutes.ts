import { Router } from "express";
import { deleteSession, getAllSessions, getSession, validateSession } from "./sessionController";

const sessionRoute = Router();

//get all
sessionRoute.get("/getall", getAllSessions);

//current session
sessionRoute.get("/", getSession);

//validate session (for frontend polling to check if session still exists)
sessionRoute.get("/validate", validateSession);

//delet-session-by-id
sessionRoute.delete("/:id", deleteSession);

export default sessionRoute;
