"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPSSTATUS = void 0;
const httpsConfig = () => ({
    // Success responses
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    // Client error responses
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    // Server error responses
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
});
exports.HTTPSSTATUS = httpsConfig();
//typeof HTTPSSTATUS it gives {} ok
// now keyof objects means key name
// (typeof HTTPSTATUS) gives that number code related to that key;
