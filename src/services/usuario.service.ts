import bcrypt from 'bcryptjs';
import { pool } from '../config/db';

const SALT_ROUNDS = 12;

/** Error de dominio: el email ya está registrado (violación UNIQUE). */
export class ErrorEmailEnUso extends Error {
  constructor(email: string) {
    super(`El email ${email} ya está registrado.`);
    this.name = 'ErrorEmailEnUso';
  }
}

export interface Rol {
  id: number;
  nombre: string;
}

export interface UsuarioListado {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  fecha_creacion: string;
}

export interface NuevoUsuario {
  nombre: string;
  email: string;
  password: string;
  rolId: number;
}

/** Lista los roles disponibles (para el <select> del panel). */
export async function listarRoles(): Promise<Rol[]> {
  const { rows } = await pool.query<Rol>('SELECT id, nombre FROM roles ORDER BY id');
  return rows;
}

/** Lista los usuarios con su rol, más recientes primero. */
export async function listarUsuarios(): Promise<UsuarioListado[]> {
  const { rows } = await pool.query<UsuarioListado>(
    `SELECT u.id, u.nombre, u.email, r.nombre AS rol, u.activo, u.fecha_creacion
       FROM usuarios u
       JOIN roles r ON r.id = u.rol_id
      ORDER BY u.id DESC`,
  );
  return rows;
}

/**
 * Crea un usuario con contraseña hasheada (bcrypt). Lanza ErrorEmailEnUso si el email
 * ya existe. Devuelve el id del nuevo usuario.
 */
export async function crearUsuario(datos: NuevoUsuario): Promise<number> {
  const hash = await bcrypt.hash(datos.password, SALT_ROUNDS);
  try {
    const { rows } = await pool.query<{ id: number }>(
      `INSERT INTO usuarios (rol_id, nombre, email, password_hash, activo)
       VALUES ($1, $2, $3, $4, TRUE)
       RETURNING id`,
      [datos.rolId, datos.nombre, datos.email, hash],
    );
    return rows[0]!.id;
  } catch (err) {
    if (err && typeof err === 'object' && (err as { code?: string }).code === '23505') {
      throw new ErrorEmailEnUso(datos.email);
    }
    throw err;
  }
}
