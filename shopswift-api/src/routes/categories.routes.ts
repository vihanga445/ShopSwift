import { Router } from 'express';
import { getCategories } from '../controllers/products.controller';

const router = Router();

// This will handle GET /api/categories
router.get('/', getCategories);

export default router;