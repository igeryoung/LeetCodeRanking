import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as userRepository from '../repositories/user.repository.js';
import { BadRequestError } from '../utils/errors.js';
import type { User } from '../types/index.js';

const updateSettingsSchema = z.object({
  language: z.enum(['en', 'zh-TW']),
});

export async function getSettings(req: Request, res: Response) {
  const user = req.user as User;
  res.json({ language: user.language ?? 'en' });
}

export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError('Invalid settings');
    }

    const user = await userRepository.updateLanguage((req.user as User).id, parsed.data.language);
    if (!user) throw new BadRequestError('User not found');

    res.json({ language: user.language });
  } catch (err) {
    next(err);
  }
}
