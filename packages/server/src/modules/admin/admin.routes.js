import express from 'express';
import { adminController } from './admin.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { ROLES } from '@marketplace/shared';

const router = express.Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/vendors', adminController.getVendors);
router.patch('/vendors/:id/verify', adminController.verifyVendor);

router.get('/products/pending', adminController.getPendingProducts);
router.patch('/products/:id/moderate', adminController.moderateProduct);

router.get('/payouts', adminController.getPayouts);
router.post('/payouts/:id/process', adminController.processPayout);

export const adminRoutes = router;
