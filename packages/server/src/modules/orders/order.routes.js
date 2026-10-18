import express from 'express';
import { orderController } from './order.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', orderController.checkout);
router.get('/my-orders', restrictTo('customer'), orderController.getUserOrders);
router.get('/vendor-orders', restrictTo('vendor'), orderController.getVendorOrders);
router.patch('/:orderId/sub-orders/:subOrderId/status', restrictTo('vendor'), orderController.updateSubOrderStatus);

export const orderRoutes = router;
