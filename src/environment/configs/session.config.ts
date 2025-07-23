import { SessionConfig } from '../interfaces/session';

export const sessionConfig = () => ({
  session: {
    secret: process.env.SESSION_SECRET,
    cookieMaxAge:
      parseInt(process.env.SESSION_COOKIE_MAX_AGE) || 24 * 60 * 60 * 1000, // Default to 1 day
  } as SessionConfig,
});
