import { Router } from 'express';
import { ProductController } from './product.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', ProductController.getProducts);
router.get('/categories', ProductController.getCategories);
router.get('/:id', ProductController.getProductById);

// Vendor routes
router.post(
  '/',
  authenticate,
  authorize('vendor', 'admin'),
  ProductController.createProduct
);

router.get(
  '/vendor/my-products',
  authenticate,
  authorize('vendor', 'admin'),
  ProductController.getVendorProducts
);

router.patch(
  '/:id',
  authenticate,
  authorize('vendor', 'admin'),
  ProductController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorize('vendor', 'admin'),
  ProductController.deleteProduct
);

// Admin moderation route
router.patch(
  '/:id/moderate',
  authenticate,
  authorize('admin'),
  ProductController.moderateProduct
);

export const productRoutes = router;
