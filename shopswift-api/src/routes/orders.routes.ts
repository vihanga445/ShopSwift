import { Router } from 'express';
import {
  createPaymentIntent, 
  getMyOrders,
  getOrderById, 
  getAllOrders, 
  updateOrderStatus,
} from '../controllers/orders.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();


router.post('/create-payment-intent', authenticate, createPaymentIntent);
router.get('/', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderById);


router.get('/admin/all', authenticate, requireAdmin, getAllOrders);
router.patch('/admin/:id/status', authenticate, requireAdmin, updateOrderStatus);

export default router;