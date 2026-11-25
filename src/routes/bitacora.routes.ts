import { Router } from 'express';
import { getBitacora } from '../controllers/bitacora.controller';
import { requireAuth, requireRole } from '../middlewares/auth';

const router = Router();

// Auditoría: solo Administrador.
router.use(requireAuth, requireRole('Administrador'));
router.get('/', getBitacora);

export default router;
