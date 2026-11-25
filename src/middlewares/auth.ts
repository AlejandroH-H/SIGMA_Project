import type { NextFunction, Request, Response } from 'express';
import { verificarToken } from '../lib/jwt';

const COOKIE = 'token';

function quiereJson(req: Request): boolean {
  return req.accepts(['html', 'json']) === 'json';
}

/**
 * Exige sesión válida. Lee la cookie JWT, la verifica y puebla `req.usuario` y
 * `res.locals.usuario` (disponible para las vistas). Si falta o es inválida:
 * HTML → redirige a /login; JSON → 401.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[COOKIE] as string | undefined;
  if (!token) {
    noAutenticado(req, res);
    return;
  }
  try {
    const usuario = verificarToken(token);
    req.usuario = usuario;
    res.locals.usuario = usuario;
    next();
  } catch {
    res.clearCookie(COOKIE);
    noAutenticado(req, res);
  }
}

function noAutenticado(req: Request, res: Response): void {
  if (quiereJson(req)) {
    res.status(401).json({ status: 'error', message: 'No autenticado' });
    return;
  }
  res.redirect('/login');
}

/**
 * Restringe el acceso a los roles indicados. Debe ir DESPUÉS de requireAuth.
 * Si el rol no está permitido: HTML → 403 (vista error); JSON → 403.
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const usuario = req.usuario;
    if (!usuario) {
      noAutenticado(req, res);
      return;
    }
    if (!roles.includes(usuario.rol)) {
      if (quiereJson(req)) {
        res.status(403).json({ status: 'error', message: 'Acceso denegado' });
        return;
      }
      res.status(403).render('error', {
        title: 'Acceso denegado',
        codigo: 403,
        mensaje: 'No tienes permisos para acceder a esta sección.',
      });
      return;
    }
    next();
  };
}

/**
 * Carga el usuario en `req`/`res.locals` si hay cookie válida, pero NUNCA bloquea
 * (para páginas públicas como /health que deben mostrar la sesión si existe).
 */
export function cargarUsuarioOpcional(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[COOKIE] as string | undefined;
  if (token) {
    try {
      const usuario = verificarToken(token);
      req.usuario = usuario;
      res.locals.usuario = usuario;
    } catch {
      res.clearCookie(COOKIE);
    }
  }
  next();
}

/** Para /login: si ya hay sesión válida, redirige al inicio en vez de mostrar el formulario. */
export function redirectIfAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[COOKIE] as string | undefined;
  if (token) {
    try {
      verificarToken(token);
      res.redirect('/');
      return;
    } catch {
      res.clearCookie(COOKIE);
    }
  }
  next();
}
