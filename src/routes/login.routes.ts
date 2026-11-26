import { Router } from 'express';
import { getlogin } from '../controllers/login.controller';

const router = Router();

router.get('/', getlogin);

export default router;
