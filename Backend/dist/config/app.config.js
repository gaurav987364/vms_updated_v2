"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const helper_1 = require("../utils/helper");
const appConfig = () => ({
    NODE_ENV: (0, helper_1.getEnviourments)("NODE_ENV", "development"),
    PORT: (0, helper_1.getEnviourments)("PORT", "5000"),
    APP_ORIGIN: (0, helper_1.getEnviourments)("APP_ORIGIN", "http://localhost:5173"),
    BASE_PATH: (0, helper_1.getEnviourments)("BASE_PATH", "/api"),
    JWT: {
        SECRET: (0, helper_1.getEnviourments)("JWT_SECRET", "my_jwt_secret"),
        EXPIRES_IN: (0, helper_1.getEnviourments)("JWT_EXPIRES_IN", "1h"),
        REFRESH_SECRET: (0, helper_1.getEnviourments)("JWT_REFRESH_SECRET", "my_jwt_refresh_secret"),
        REFRESH_EXPIRES_IN: (0, helper_1.getEnviourments)("JWT_REFRESH_EXPIRES_IN", "30d"),
    },
    MONGO_URI: (0, helper_1.getEnviourments)("MONGO_URI", "mongodb+srv://gauravsharma_db_user:THyJ2TG3YSQKDVmj@cluster0.akto2qh.mongodb.net/?appName=VMS_TEST"),
    EMAIL: {
        URL: (0, helper_1.getEnviourments)("EMAIL_URL", "https://y98h049oei.execute-api.ap-south-1.amazonaws.com/prod/mushinLambdaNotifier"),
        API_KEY: (0, helper_1.getEnviourments)("EMAIL_API_KEY", "zZEirjTOLT7lhEwTJ0WXz51uuKQIoAXL4tiRFLUs"),
    },
});
exports.config = appConfig();
