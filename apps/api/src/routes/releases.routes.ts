import { Router } from 'express';
import { listReleases } from '../controllers/catalog.controller.js';

const router = Router();

router.get('/', listReleases);

export default router;
