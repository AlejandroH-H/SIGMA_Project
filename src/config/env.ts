import dotenv from 'dotenv';

dotenv.config();

function requerido(nombre: string, valorPorDefecto?: string): string {
  const valor = process.env[nombre] ?? valorPorDefecto;
  if (valor === undefined || valor === '') {
    throw new Error(`Variable de entorno requerida no definida: ${nombre}`);
  }
  return valor;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: requerido(
    'DATABASE_URL',
    'postgresql://sigma:sigma_dev_pass@localhost:5432/sigma_db',
  ),
  jwtSecret: process.env.JWT_SECRET ?? 'dev_secret_cambiar_en_produccion',
} as const;

export const isProd = env.nodeEnv === 'production';
