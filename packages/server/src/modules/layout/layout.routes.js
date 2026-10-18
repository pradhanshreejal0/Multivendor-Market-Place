import express from 'express';
import { layoutController } from './layout.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { ROLES } from '@marketplace/shared';

const router = express.Router();

router.get('/:pageName', layoutController.getLayout);
router.post('/:pageName/draft', authenticate, authorize(ROLES.ADMIN), layoutController.saveDraft);
router.post('/:pageName/publish', authenticate, authorize(ROLES.ADMIN), layoutController.publishLayout);

export const layoutRoutes = router;
