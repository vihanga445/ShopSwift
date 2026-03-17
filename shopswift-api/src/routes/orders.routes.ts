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

// --- Customer Routes ---
// Users must be logged in to pay for things or see their own history
router.post('/create-payment-intent', authenticate, createPaymentIntent);
router.get('/', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderById);

// --- Admin Routes ---
// Only staff with the 'Admin' role can see everyone's orders or change the status
router.get('/admin/all', authenticate, requireAdmin, getAllOrders);
router.patch('/admin/:id/status', authenticate, requireAdmin, updateOrderStatus);

export default router;