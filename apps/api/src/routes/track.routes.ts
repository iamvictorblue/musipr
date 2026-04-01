import { Router } from 'express';
import { getTrackBySlug } from '../controllers/catalog.controller.js';
import {
  createTrackHandler,
  likeTrackHandler,
  listTracks,
  reportInfringement,
  saveTrackHandler,
  unlikeTrackHandler,
  unsaveTrackHandler
} from '../controllers/track.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.get('/', listTracks);
router.post('/', requireAuth, createTrackHandler);
router.post('/report', reportInfringement);
router.post('/:id/like', requireAuth, likeTrackHandler);
router.delete('/:id/like', requireAuth, unlikeTrackHandler);
router.post('/:id/save', requireAuth, saveTrackHandler);
router.delete('/:id/save', requireAuth, unsaveTrackHandler);
router.get('/:slug', getTrackBySlug);

export default router;
