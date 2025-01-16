declare namespace NodeJS {
  export interface ProcessEnv {
    DATABASE_URL: string;
    jwtUserSecretKey: string;
    jwtRefreshTokenKey: string;
    ACCESS_TOKEN_EXPIRY_DATE: string;
    REFRESH_TOKEN_EXPIRY_DATE: string;
    jwtOtpSecretKey: string;
    OTP_TOKEN_EXPIRY_DATE: string;
    MAIL_HOST: string;
    MAIL_PORT: string;
    MAIL_USER: string;
    MAIL_PASSWORD: string;
    MAIL_SENDER: string;
    VERIFY_CLIENT_EMAIL_URL: string;
    VERIFY_MENTOR_EMAIL_URL: string;
    PORT: string;
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
    BUCKET_NAME: string;
  }
}
