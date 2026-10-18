import express from 'express';
import { paymentController } from './payment.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/initiate', authenticate, paymentController.initiate);
router.post('/bank-transfer', authenticate, paymentController.submitBankTransfer);

// Gateway callbacks / verification (GET & POST)
router.get('/verify/:gateway', paymentController.verify);
router.post('/verify/:gateway', paymentController.verify);

// Admin route to confirm bank transfers / manual payments
router.patch('/:paymentId/confirm', authenticate, authorize('admin'), paymentController.confirmBankTransfer);

export const paymentRoutes = router;
