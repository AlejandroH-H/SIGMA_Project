import { crearApp } from './app';
import { env } from './config/env';
import { cerrarPool } from './config/db';

const app = crearApp();

const server = app.listen(env.port, () => {
  console.log(`\nSIGMA escuchando en http://localhost:${env.port}`);
  console.log(`   Entorno: ${env.nodeEnv}`);
  console.log(`   Salud:   http://localhost:${env.port}/health\n`);
});

async function apagar(signal: string): Promise<void> {
  console.log(`\n${signal} recibido. Cerrando servidor...`);
  server.close(async () => {
    await cerrarPool();
    console.log('Servidor y pool cerrados. Hasta luego.');
    process.exit(0);
  });
}

process.on('SIGINT', () => void apagar('SIGINT'));
process.on('SIGTERM', () => void apagar('SIGTERM'));
