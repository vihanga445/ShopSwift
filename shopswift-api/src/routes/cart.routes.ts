import { Router } from 'express';
import { 
  getCart, 
  addItem, 
  updateItem, 
  removeItem, 
  clearCart 
} from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Global Protection: Every route below this line now requires the user to be logged in
router.use(authenticate); 

// --- Cart Actions ---
router.get('/', getCart);                // View my basket
router.post('/items', addItem);          // Put something in the basket
router.patch('/items/:itemId', updateItem); // Change quantity (e.g., from 1 to 2)
router.delete('/items/:itemId', removeItem); // Take one specific item out
router.delete('/', clearCart);           // Dump everything out of the basket

export default router;