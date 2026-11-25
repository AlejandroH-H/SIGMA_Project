import { Router } from 'express';
import { getInicio } from '../controllers/inicio.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.get('/', requireAuth, getInicio);

export default router;
