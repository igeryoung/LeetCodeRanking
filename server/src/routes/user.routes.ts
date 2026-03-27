import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as userController from '../controllers/user.controller.js';

const router = Router();

router.get('/settings', requireAuth, userController.getSettings);
router.put('/settings', requireAuth, userController.updateSettings);

export default router;
