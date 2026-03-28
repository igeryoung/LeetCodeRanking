import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import * as statusController from '../controllers/status.controller.js';

const router = Router();

router.use(requireAuth);

const upsertStatusSchema = z.object({
  status: z.enum(['solved', 'attempted', 'todo']),
  notes: z.string().max(5000).default(''),
  timeSpent: z.number().int().min(0).optional(),
});

router.get('/', statusController.getStatuses);
router.put('/:leetcodeId', validateBody(upsertStatusSchema), statusController.upsertStatus);
router.delete('/:leetcodeId', statusController.removeStatus);

export default router;
