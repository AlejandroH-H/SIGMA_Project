import bcrypt from 'bcryptjs';
import { pool } from '../config/db';
import type { AuthUser } from '../lib/jwt';

/**
 * Verifica las credenciales contra la BD. Solo autentica usuarios con `activo = true`
 * (respeta el soft-delete). Devuelve el AuthUser si coinciden, o null en caso contrario.
 */
export async function verificarCredenciales(
  email: string,
  password: string,
): Promise<AuthUser | null> {
  const { rows } = await pool.query<{
    id: number;
    nombre: string;
    email: string;
    password_hash: string;
    rol: string;
  }>(
    `SELECT u.id, u.nombre, u.email, u.password_hash, r.nombre AS rol
       FROM usuarios u
       JOIN roles r ON r.id = u.rol_id
      WHERE u.email = $1 AND u.activo = TRUE`,
    [email],
  );

  const fila = rows[0];
  if (!fila) {
    // Igualamos coste de cómputo para no filtrar si el email existe (timing).
    await bcrypt.compare(password, '$2a$12$0000000000000000000000000000000000000000000000000000');
    return null;
  }

  const ok = await bcrypt.compare(password, fila.password_hash);
  if (!ok) return null;

  return { id: fila.id, nombre: fila.nombre, email: fila.email, rol: fila.rol };
}
