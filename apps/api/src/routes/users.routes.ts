import { Router } from 'express';
import { getMyLibrary } from '../controllers/users.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/me/library', requireAuth, getMyLibrary);

export default router;
