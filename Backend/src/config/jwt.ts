import { env } from './env';

export const JWT_SECRET = env.jwtSecret;
export const JWT_EXPIRES_IN_SECONDS = 86400; // 24 horas
