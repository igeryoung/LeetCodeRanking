import { Router } from 'express';
import * as problemsController from '../controllers/problems.controller.js';

const router = Router();

router.get('/', problemsController.getProblems);

export default router;
