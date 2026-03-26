import { Router } from 'express';
import { createUploadUrlHandler } from '../controllers/upload.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.post('/signed-url', requireAuth, requireRole('ARTIST', 'VERIFIED_ARTIST'), createUploadUrlHandler);

export default router;
