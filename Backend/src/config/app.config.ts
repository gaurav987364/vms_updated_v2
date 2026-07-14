import { getEnviourments } from "../utils/helper";

const appConfig = () => ({
  NODE_ENV: getEnviourments("NODE_ENV", "development"),
  PORT: getEnviourments("PORT", "5000"),
  APP_ORIGIN: getEnviourments("APP_ORIGIN", "http://localhost:5173"),
  BASE_PATH: getEnviourments("BASE_PATH", "/api"),
  JWT: {
    SECRET: getEnviourments("JWT_SECRET", "my_jwt_secret"),
    EXPIRES_IN: getEnviourments("JWT_EXPIRES_IN", "1h"),
    REFRESH_SECRET: getEnviourments(
      "JWT_REFRESH_SECRET",
      "my_jwt_refresh_secret",
    ),
    REFRESH_EXPIRES_IN: getEnviourments("JWT_REFRESH_EXPIRES_IN", "30d"),
  },
  MONGO_URI: getEnviourments("MONGO_URI", "mongodb+srv://gauravsharma_db_user:THyJ2TG3YSQKDVmj@cluster0.akto2qh.mongodb.net/?appName=VMS_TEST"),
  EMAIL: {
    URL: getEnviourments("EMAIL_URL", "https://y98h049oei.execute-api.ap-south-1.amazonaws.com/prod/mushinLambdaNotifier"),
    API_KEY: getEnviourments("EMAIL_API_KEY", "zZEirjTOLT7lhEwTJ0WXz51uuKQIoAXL4tiRFLUs"),
  },
});

export const config = appConfig();
