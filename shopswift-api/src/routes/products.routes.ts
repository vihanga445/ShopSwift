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

// This handles file uploads (like product photos)
// It keeps the file in your computer's temporary memory and limits size to 5MB
const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// --- Public Routes ---
// Anyone (even people not logged in) can see these
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// --- Admin Routes ---
// Only logged-in Admins can use these
router.post('/', authenticate, requireAdmin, createProduct);
router.patch('/:id', authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);
router.post('/:id/image', authenticate, requireAdmin, upload.single('file'), uploadProductImage);

export default router;