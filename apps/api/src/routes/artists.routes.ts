import { Router } from 'express';
import { getArtistBySlug } from '../controllers/catalog.controller.js';

const router = Router();

router.get('/:slug', getArtistBySlug);

export default router;
