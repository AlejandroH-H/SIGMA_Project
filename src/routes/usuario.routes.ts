import { Router } from 'express';
import { getUsuarios, postUsuarios } from '../controllers/usuario.controller';
import { requireAuth, requireRole } from '../middlewares/auth';

const router = Router();

// Gestión de usuarios: exclusiva del Administrador.
router.use(requireAuth, requireRole('Administrador'));
router.get('/', getUsuarios);
router.post('/', postUsuarios);

export default router;
