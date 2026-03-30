import { Router } from 'express';
import { listEvents } from '../controllers/catalog.controller.js';

const router = Router();

router.get('/', listEvents);

export default router;
