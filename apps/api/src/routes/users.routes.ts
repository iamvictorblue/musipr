import { Router } from 'express';
import {
  followArtistHandler,
  getMyEngagement,
  getMyLibrary,
  remindEventHandler,
  saveMerchHandler,
  unfollowArtistHandler,
  unremindEventHandler,
  unsaveMerchHandler
} from '../controllers/users.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/me/library', requireAuth, getMyLibrary);
router.get('/me/engagement', requireAuth, getMyEngagement);
router.post('/me/follows/artists/:artistId', requireAuth, followArtistHandler);
router.delete('/me/follows/artists/:artistId', requireAuth, unfollowArtistHandler);
router.post('/me/reminders/events/:eventId', requireAuth, remindEventHandler);
router.delete('/me/reminders/events/:eventId', requireAuth, unremindEventHandler);
router.post('/me/saved-merch/:merchId', requireAuth, saveMerchHandler);
router.delete('/me/saved-merch/:merchId', requireAuth, unsaveMerchHandler);

export default router;
