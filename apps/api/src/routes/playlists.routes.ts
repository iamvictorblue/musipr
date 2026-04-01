import { Router } from 'express';
import { getPlaylistBySlug, listPlaylists, savePlaylist, unsavePlaylist } from '../controllers/catalog.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', listPlaylists);
router.post('/:id/save', requireAuth, savePlaylist);
router.delete('/:id/save', requireAuth, unsavePlaylist);
router.get('/:slug', getPlaylistBySlug);

export default router;
