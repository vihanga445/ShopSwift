import { Router } from 'express';
import multer from 'multer';
import {
  getProducts, 
  getProductById, 
  getFeaturedProducts, 
  getCategories,
  createProduct, 
  updateProduct, 
  deleteProduct, 
  uploadProductImage,
} from '../controllers/products.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();


const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 5 * 1024 * 1024 } 
});


router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);


router.post('/', authenticate, requireAdmin, createProduct);
router.patch('/:id', authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);
router.post('/:id/image', authenticate, requireAdmin, upload.single('file'), uploadProductImage);

export default router;