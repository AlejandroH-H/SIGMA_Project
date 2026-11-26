import type { Request, Response } from 'express';


export function getlogin(_req: Request, res: Response): void {
  res.render('login', { title: 'Inicio de Sesion', layout: 'layouts/auth' });
}
