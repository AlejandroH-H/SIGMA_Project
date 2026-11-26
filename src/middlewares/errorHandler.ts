import type { NextFunction, Request, Response } from 'express';

/** 404 — ruta no encontrada. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404);
  if (req.accepts(['html', 'json']) === 'json') {
    res.json({ status: 'error', message: 'Recurso no encontrado' });
    return;
  }
  res.render('error', {
    title: 'No encontrado',
    codigo: 404,
    mensaje: 'La página que buscas no existe.',
    usuario: { nombre: 'Invitado', rol: 'Invitado' },
  });
}

/** Manejador de errores central. Debe registrarse al final de la cadena. */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  const mensaje = err instanceof Error ? err.message : 'Error interno del servidor';
  console.error('[error]', mensaje);

  res.status(500);
  if (req.accepts(['html', 'json']) === 'json') {
    res.json({ status: 'error', message: mensaje });
    return;
  }
  res.render('error', {
    title: 'Error',
    codigo: 500,
    mensaje: 'Ocurrió un error interno. Intenta de nuevo más tarde.',
    usuario: { nombre: 'Invitado', rol: 'Invitado' },
  });
}
