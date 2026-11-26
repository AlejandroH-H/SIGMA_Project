import type { Request, Response } from 'express';
import { pingDb } from '../services/health.service';

/**
 * GET /health
 * Responde JSON si el cliente acepta application/json; de lo contrario renderiza
 * la vista. HTTP 200 si la DB responde, 503 si no.
 */
export async function getHealth(req: Request, res: Response): Promise<void> {
  const salud = await pingDb();
  const estado = salud.db === 'ok' ? 'ok' : 'error';
  const httpStatus = salud.db === 'ok' ? 200 : 503;

  const payload = {
    status: estado,
    db: salud.db,
    dbTime: salud.dbTime,
    node: process.version,
    serverTime: new Date().toISOString(),
    ...(salud.error ? { error: salud.error } : {}),
  };

  if (req.accepts(['html', 'json']) === 'json') {
    res.status(httpStatus).json(payload);
    return;
  }

  res.status(httpStatus).render('health', {
    title: 'Estado del sistema',
    salud: payload,
    usuario: { nombre: 'Invitado', rol: 'Invitado' }, // stub Fase 0 (sin auth aún)
  });
}
