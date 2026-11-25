import { Router } from 'express';
import { getLogin, postLogin, logout } from '../controllers/auth.controller';
import { redirectIfAuth } from '../middlewares/auth';

const router = Router();

router.get('/login', redirectIfAuth, getLogin);
router.post('/login', redirectIfAuth, postLogin);
router.post('/logout', logout);

export default router;
