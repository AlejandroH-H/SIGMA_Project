import jwt from 'jsonwebtoken';
import { env } from '../config/env';

/** Usuario autenticado derivado del JWT (sin datos sensibles). */
export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

const EXPIRES_IN = '8h';
/** Vida de la cookie en milisegundos (coincide con EXPIRES_IN). */
export const TOKEN_MAX_AGE_MS = 8 * 60 * 60 * 1000;

/** Firma un JWT con los datos del usuario autenticado. */
export function firmarToken(usuario: AuthUser): string {
  return jwt.sign(
    { sub: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    env.jwtSecret,
    { expiresIn: EXPIRES_IN },
  );
}

/** Verifica un JWT y reconstruye el AuthUser. Lanza si es inválido/expirado. */
export function verificarToken(token: string): AuthUser {
  const payload = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload;
  return {
    id: Number(payload.sub),
    nombre: String(payload.nombre),
    email: String(payload.email),
    rol: String(payload.rol),
  };
}
