import { Router } from 'express';
import { dashboard, disableTrack, issueStrike } from '../controllers/admin.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireRole('ADMIN'));
router.get('/dashboard', dashboard);
router.post('/tracks/:id/disable', disableTrack);
router.post('/strikes', issueStrike);

export default router;
