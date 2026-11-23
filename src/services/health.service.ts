import { pool } from '../config/db';

export interface EstadoSalud {
  db: 'ok' | 'error';
  dbTime: string | null;
  error?: string;
}

/**
 * Verifica la conexión a PostgreSQL ejecutando una consulta trivial.
 * Nunca lanza: devuelve el estado para que el controlador decida el código HTTP.
 */
export async function pingDb(): Promise<EstadoSalud> {
  try {
    const { rows } = await pool.query<{ now: string }>('SELECT now() AS now');
    return { db: 'ok', dbTime: rows[0]?.now ?? null };
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : String(err);
    return { db: 'error', dbTime: null, error: mensaje };
  }
}
