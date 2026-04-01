import { Request, Response, NextFunction } from 'express';
import * as statusService from '../services/status.service.js';
import type { User } from '../types/index.js';

export async function getStatuses(req: Request, res: Response, next: NextFunction) {
  try {
    const statuses = await statusService.getUserStatuses((req.user as User).id);
    res.json(statuses);
  } catch (err) {
    next(err);
  }
}

export async function upsertStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const leetcodeId = parseInt(req.params.leetcodeId, 10);
    const { status, notes = '', timeSpent } = req.body;

    const result = await statusService.upsertStatus(
      (req.user as User).id,
      leetcodeId,
      status,
      notes,
      typeof timeSpent === 'number' ? timeSpent : undefined
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function removeStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const leetcodeId = parseInt(req.params.leetcodeId, 10);
    await statusService.removeStatus((req.user as User).id, leetcodeId);
    res.json({ message: 'Status removed' });
  } catch (err) {
    next(err);
  }
}

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await statusService.getStats((req.user as User).id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}
