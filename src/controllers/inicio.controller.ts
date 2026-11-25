import type { Request, Response } from 'express';

/** GET / — landing tras iniciar sesión. */
export function getInicio(req: Request, res: Response): void {
  res.render('inicio', { title: 'Inicio', usuario: req.usuario });
}
