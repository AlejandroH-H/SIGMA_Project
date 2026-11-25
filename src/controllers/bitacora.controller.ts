import type { Request, Response } from 'express';
import { listarRecientes } from '../services/bitacora.service';

/** GET /bitacora — visor de solo lectura de la auditoría (Administrador). */
export async function getBitacora(_req: Request, res: Response): Promise<void> {
  const entradas = await listarRecientes(100);
  res.render('bitacora/index', { title: 'Auditoría', entradas });
}
