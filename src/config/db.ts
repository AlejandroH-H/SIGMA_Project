import { Pool } from 'pg';
import { env } from './env';

/**
 * Pool de conexiones a PostgreSQL. Reutilizar SIEMPRE este pool.
 * Toda consulta debe ser parametrizada (`$1, $2, ...`); prohibido concatenar SQL.
 */
export const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  // Error en un cliente ocioso del pool: se registra pero no debe tumbar el proceso.
  console.error('[db] Error inesperado en cliente ocioso del pool:', err.message);
});

export async function cerrarPool(): Promise<void> {
  await pool.end();
}
