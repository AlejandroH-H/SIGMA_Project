/**
 * db/generate-seed-hashes.ts
 *
 * Prepara los scripts de inicialización que Postgres montará en el contenedor:
 *   db/init-scripts/01-init.sql  (copia de db/init.sql)
 *   db/init-scripts/02-seed.sql  (db/seed.sql con los hashes bcrypt inyectados)
 *
 * Genera una contraseña aleatoria segura para CADA usuario precargado (admin, gerente,
 * analista), la hashea con bcryptjs e imprime las credenciales UNA sola vez.
 * Ejecutar con: `npm run db:prepare`.
 */
import { randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import bcrypt from 'bcryptjs';

const DB_DIR = __dirname;
const OUT_DIR = join(DB_DIR, 'init-scripts');
const SALT_ROUNDS = 12;

// Token en seed.sql -> metadatos del usuario precargado.
const USUARIOS = [
  { token: '__HASH_ADMIN__', email: 'admin@sigma.local', rol: 'Administrador' },
  { token: '__HASH_GERENTE__', email: 'gerente@sigma.local', rol: 'Gerente Académico' },
  { token: '__HASH_ANALISTA__', email: 'analista@sigma.local', rol: 'Analista' },
] as const;

function generarPassword(): string {
  // 18 bytes -> 24 chars base64url (sin caracteres ambiguos); sufijo que garantiza
  // al menos un dígito y un símbolo.
  return randomBytes(18).toString('base64url') + '9!';
}

async function main(): Promise<void> {
  let seed = readFileSync(join(DB_DIR, 'seed.sql'), 'utf8');
  const credenciales: { email: string; rol: string; password: string }[] = [];

  for (const u of USUARIOS) {
    if (!seed.includes(u.token)) {
      throw new Error(`No se encontró el token ${u.token} en db/seed.sql`);
    }
    const password = generarPassword();
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    seed = seed.split(u.token).join(hash);
    credenciales.push({ email: u.email, rol: u.rol, password });
  }

  mkdirSync(OUT_DIR, { recursive: true });
  copyFileSync(join(DB_DIR, 'init.sql'), join(OUT_DIR, '01-init.sql'));
  writeFileSync(join(OUT_DIR, '02-seed.sql'), seed, 'utf8');

  console.log('\n✅ Scripts de inicialización generados en db/init-scripts/ (01-init.sql, 02-seed.sql)\n');
  console.log('──────────────────────────────────────────────────────────────');
  console.log('  CREDENCIALES DE USUARIOS PRECARGADOS (se muestran una vez)');
  console.log('──────────────────────────────────────────────────────────────');
  for (const c of credenciales) {
    console.log(`  [${c.rol}]`);
    console.log(`    Email:    ${c.email}`);
    console.log(`    Password: ${c.password}`);
  }
  console.log('──────────────────────────────────────────────────────────────');
  console.log('  Guárdalas ahora. No se vuelven a mostrar.\n');
}

main().catch((err) => {
  console.error('Error generando los hashes de semilla:', err);
  process.exit(1);
});
