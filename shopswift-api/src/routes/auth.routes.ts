import { Router } from 'express';
import { register, login, refresh, logout, me } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public Routes (Anyone can access these)
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);

// Private Routes (You must have a valid 'Wristband' / Token to enter)
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

export default router;