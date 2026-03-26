import { Router } from 'express';
import { createTrackHandler, listTracks, reportInfringement } from '../controllers/track.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.get('/', listTracks);
router.post('/', requireAuth, createTrackHandler);
router.post('/report', reportInfringement);

export default router;
