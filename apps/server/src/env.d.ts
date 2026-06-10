declare global {
  namespace NodeJS {
    interface ProcessEnv {
      COOKIE_DOMAIN?: string;
      COOKIE_SECURE?: string;
      CORS_ORIGINS?: string;
      DATABASE_URL: string;
      JWT_ACCESS_EXPIRES_IN?: string;
      JWT_ACCESS_SECRET: string;
      NODE_ENV?: 'development' | 'production' | 'test';
      PORT?: string;
      R2_ACCESS_KEY_ID: string;
      R2_ACCOUNT_ID: string;
      R2_BUCKET: string;
      R2_PUBLIC_BASE_URL: string;
      R2_S3_ENDPOINT: string;
      R2_SECRET_ACCESS_KEY: string;
      TEST_DATABASE_URL?: string;
    }
  }
}

export {};
