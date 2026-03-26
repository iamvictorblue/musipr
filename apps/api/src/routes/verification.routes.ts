import { Router } from 'express';
import { listPending, reviewVerification, submitVerification } from '../controllers/verification.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.post('/submit', requireAuth, submitVerification);
router.get('/pending', requireAuth, requireRole('ADMIN'), listPending);
router.post('/:id/review', requireAuth, requireRole('ADMIN'), reviewVerification);

export default router;
