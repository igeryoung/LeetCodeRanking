import { Router } from 'express';
import authRoutes from './auth.routes.js';
import problemsRoutes from './problems.routes.js';
import statusRoutes from './status.routes.js';
import { requireAuth } from '../middleware/auth.js';
import * as statusController from '../controllers/status.controller.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/problems', problemsRoutes);
router.use('/status', statusRoutes);
router.get('/stats', requireAuth, statusController.getStats);

export default router;
