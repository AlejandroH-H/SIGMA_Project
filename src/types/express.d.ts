import type { AuthUser } from '../lib/jwt';

// Augmenta Express.Request con el usuario autenticado que puebla requireAuth.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuario?: AuthUser;
    }
  }
}

export {};
