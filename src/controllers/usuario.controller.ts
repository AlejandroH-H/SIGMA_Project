import type { Request, Response } from 'express';
import {
  crearUsuario,
  listarUsuarios,
  listarRoles,
  ErrorEmailEnUso,
} from '../services/usuario.service';
import { registrarAccion } from '../services/bitacora.service';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;

async function render(
  res: Response,
  opts: { error?: string; exito?: string; form?: Record<string, string>; status?: number },
): Promise<void> {
  const [usuarios, roles] = await Promise.all([listarUsuarios(), listarRoles()]);
  res.status(opts.status ?? 200).render('usuarios/index', {
    title: 'Usuarios',
    usuarios,
    roles,
    error: opts.error ?? null,
    exito: opts.exito ?? null,
    form: opts.form ?? {},
  });
}

/** GET /usuarios — panel de administración de usuarios. */
export async function getUsuarios(_req: Request, res: Response): Promise<void> {
  await render(res, {});
}

/** POST /usuarios — crea un usuario y audita CREAR_USUARIO. */
export async function postUsuarios(req: Request, res: Response): Promise<void> {
  const nombre = String(req.body.nombre ?? '').trim();
  const email = String(req.body.email ?? '').trim().toLowerCase();
  const password = String(req.body.password ?? '');
  const rolId = Number(req.body.rolId);
  const form = { nombre, email, rolId: String(req.body.rolId ?? '') };

  const roles = await listarRoles();
  if (!nombre || !email || !password || !Number.isInteger(rolId)) {
    await render(res, { error: 'Todos los campos son obligatorios.', form, status: 400 });
    return;
  }
  if (!EMAIL_RE.test(email)) {
    await render(res, { error: 'El email no tiene un formato válido.', form, status: 400 });
    return;
  }
  if (password.length < PASSWORD_MIN) {
    await render(res, {
      error: `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres.`,
      form,
      status: 400,
    });
    return;
  }
  if (!roles.some((r) => r.id === rolId)) {
    await render(res, { error: 'El rol seleccionado no es válido.', form, status: 400 });
    return;
  }

  try {
    const nuevoId = await crearUsuario({ nombre, email, password, rolId });
    await registrarAccion({
      usuarioId: req.usuario?.id ?? null,
      accion: 'CREAR_USUARIO',
      modulo: 'usuarios',
      detalles: { nuevoUsuarioId: nuevoId, email, rolId },
    });
    await render(res, { exito: `Usuario ${email} creado correctamente.` });
  } catch (err) {
    if (err instanceof ErrorEmailEnUso) {
      await render(res, { error: err.message, form, status: 409 });
      return;
    }
    throw err;
  }
}
