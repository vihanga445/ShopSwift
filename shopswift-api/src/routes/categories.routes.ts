import { Router } from 'express';
import { getCategories } from '../controllers/products.controller';

const router = Router();

router.get('/', getCategories);

export default router;