/**
 * db/generate-admin-hash.ts
 *
 * Prepara los scripts de inicialización que Postgres montará en el contenedor:
 *   db/init-scripts/01-init.sql  (copia de db/init.sql)
 *   db/init-scripts/02-seed.sql  (db/seed.sql con el hash bcrypt del admin inyectado)
 *
 * Genera una contraseña aleatoria segura para el usuario admin, la hashea con
 * bcrypt y la imprime UNA sola vez. Ejecutar con: `npm run db:prepare`.
 */
import { randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import bcrypt from 'bcryptjs';

const DB_DIR = __dirname;
const OUT_DIR = join(DB_DIR, 'init-scripts');
const PLACEHOLDER = '__ADMIN_PASSWORD_HASH__';
const SALT_ROUNDS = 12;

function generarPassword(): string {
  // 18 bytes -> 24 chars base64url (sin caracteres ambiguos); añade un sufijo
  // que garantiza al menos un dígito y un símbolo.
  return randomBytes(18).toString('base64url') + '9!';
}

async function main(): Promise<void> {
  const seedTemplate = readFileSync(join(DB_DIR, 'seed.sql'), 'utf8');
  if (!seedTemplate.includes(PLACEHOLDER)) {
    throw new Error(`No se encontró el token ${PLACEHOLDER} en db/seed.sql`);
  }

  const password = generarPassword();
  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  mkdirSync(OUT_DIR, { recursive: true });
  copyFileSync(join(DB_DIR, 'init.sql'), join(OUT_DIR, '01-init.sql'));
  writeFileSync(join(OUT_DIR, '02-seed.sql'), seedTemplate.split(PLACEHOLDER).join(hash), 'utf8');

  console.log('\n✅ Scripts de inicialización generados en db/init-scripts/');
  console.log('   - 01-init.sql');
  console.log('   - 02-seed.sql (hash del admin inyectado)\n');
  console.log('──────────────────────────────────────────────────────');
  console.log('  CREDENCIALES DEL ADMINISTRADOR (se muestran una vez)');
  console.log('  Email:    admin@sigma.local');
  console.log(`  Password: ${password}`);
  console.log('──────────────────────────────────────────────────────');
  console.log('  Guárdala ahora. No se vuelve a mostrar.\n');
}

main().catch((err) => {
  console.error('Error generando el hash del admin:', err);
  process.exit(1);
});
