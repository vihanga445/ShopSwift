import { Router } from 'express';
import { getDashboard } from '../controllers/dashboard.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, requireAdmin, getDashboard);

export default router;