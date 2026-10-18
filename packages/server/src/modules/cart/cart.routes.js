import express from 'express';
import { cartController } from './cart.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('customer'));

router.route('/')
  .get(cartController.getCart)
  .post(cartController.addItem)
  .delete(cartController.clearCart);

router.post('/sync', cartController.syncCart);

router.route('/:itemId')
  .patch(cartController.updateItem)
  .delete(cartController.removeItem);

export const cartRoutes = router;
