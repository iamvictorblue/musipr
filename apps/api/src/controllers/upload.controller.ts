import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { createUploadUrl } from '../services/upload.service.js';

export async function createUploadUrlHandler(req: AuthRequest, res: Response) {
  const body = z.object({ filename: z.string(), contentType: z.string() }).parse(req.body);
  const signed = await createUploadUrl({ artistId: req.auth!.userId, filename: body.filename, contentType: body.contentType });
  res.json(signed);
}
