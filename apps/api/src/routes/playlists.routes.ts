import { Router } from 'express';
import { getPlaylistBySlug, listPlaylists } from '../controllers/catalog.controller.js';

const router = Router();

router.get('/', listPlaylists);
router.get('/:slug', getPlaylistBySlug);

export default router;
