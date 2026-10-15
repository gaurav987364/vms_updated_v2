"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sessionController_1 = require("./sessionController");
const sessionRoute = (0, express_1.Router)();
//get all
sessionRoute.get("/getall", sessionController_1.getAllSessions);
//current session
sessionRoute.get("/", sessionController_1.getSession);
//validate session (for frontend polling to check if session still exists)
sessionRoute.get("/validate", sessionController_1.validateSession);
//delet-session-by-id
sessionRoute.delete("/:id", sessionController_1.deleteSession);
exports.default = sessionRoute;
