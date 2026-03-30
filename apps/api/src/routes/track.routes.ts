import { Router } from 'express';
import { getTrackBySlug } from '../controllers/catalog.controller.js';
import { createTrackHandler, listTracks, reportInfringement } from '../controllers/track.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.get('/', listTracks);
router.post('/', requireAuth, createTrackHandler);
router.post('/report', reportInfringement);
router.get('/:slug', getTrackBySlug);

export default router;
