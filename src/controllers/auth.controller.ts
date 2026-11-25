import type { Request, Response } from 'express';
import { verificarCredenciales } from '../services/auth.service';
import { registrarAccion } from '../services/bitacora.service';
import { firmarToken, TOKEN_MAX_AGE_MS } from '../lib/jwt';
import { isProd } from '../config/env';

const COOKIE = 'token';

function cookieOpts() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProd,
    maxAge: TOKEN_MAX_AGE_MS,
    path: '/',
  };
}

/** GET /login — formulario de inicio de sesión (sin layout de app). */
export function getLogin(_req: Request, res: Response): void {
  res.render('auth/login', { title: 'Iniciar sesión', layout: false, error: null, email: '' });
}

/** POST /login — valida credenciales, emite cookie JWT y audita LOGIN. */
export async function postLogin(req: Request, res: Response): Promise<void> {
  const email = String(req.body.email ?? '').trim().toLowerCase();
  const password = String(req.body.password ?? '');

  const rerenderError = (mensaje: string) =>
    res.status(401).render('auth/login', {
      title: 'Iniciar sesión',
      layout: false,
      error: mensaje,
      email,
    });

  if (!email || !password) {
    rerenderError('Ingresa tu email y contraseña.');
    return;
  }

  const usuario = await verificarCredenciales(email, password);
  if (!usuario) {
    rerenderError('Credenciales inválidas.');
    return;
  }

  const token = firmarToken(usuario);
  res.cookie(COOKIE, token, cookieOpts());
  await registrarAccion({
    usuarioId: usuario.id,
    accion: 'LOGIN',
    modulo: 'auth',
    detalles: { email: usuario.email, rol: usuario.rol },
  });
  res.redirect('/');
}

/** POST /logout — borra la cookie de sesión. */
export function logout(_req: Request, res: Response): void {
  res.clearCookie(COOKIE, { path: '/' });
  res.redirect('/login');
}
