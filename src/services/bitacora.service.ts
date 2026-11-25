import { pool } from '../config/db';

export interface AccionBitacora {
  usuarioId: number | null;
  accion: string;
  modulo?: string | null;
  detalles?: unknown;
}

export interface EntradaBitacora {
  id: string;
  usuario_id: number | null;
  usuario_email: string | null;
  accion: string;
  modulo: string | null;
  detalles: unknown;
  fecha_hora: string;
}

/**
 * Registra una acción en `bitacora_acciones`. Nunca debe tumbar la operación principal:
 * si falla, se registra el error y se continúa.
 */
export async function registrarAccion(entrada: AccionBitacora): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO bitacora_acciones (usuario_id, accion, modulo, detalles)
       VALUES ($1, $2, $3, $4)`,
      [
        entrada.usuarioId,
        entrada.accion,
        entrada.modulo ?? null,
        entrada.detalles === undefined ? null : JSON.stringify(entrada.detalles),
      ],
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[bitacora] No se pudo registrar la acción:', entrada.accion, '-', msg);
  }
}

/** Devuelve las acciones más recientes (para el visor del Administrador). */
export async function listarRecientes(limite = 100): Promise<EntradaBitacora[]> {
  const { rows } = await pool.query<EntradaBitacora>(
    `SELECT b.id, b.usuario_id, u.email AS usuario_email,
            b.accion, b.modulo, b.detalles, b.fecha_hora
       FROM bitacora_acciones b
       LEFT JOIN usuarios u ON u.id = b.usuario_id
      ORDER BY b.fecha_hora DESC, b.id DESC
      LIMIT $1`,
    [limite],
  );
  return rows;
}
