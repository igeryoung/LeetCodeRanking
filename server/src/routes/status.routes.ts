import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as statusController from '../controllers/status.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', statusController.getStatuses);
router.put('/:leetcodeId', statusController.upsertStatus);
router.delete('/:leetcodeId', statusController.removeStatus);

export default router;
