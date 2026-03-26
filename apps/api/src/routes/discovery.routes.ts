import { Router } from 'express';
import { discoveryHome, globalSearch } from '../controllers/discovery.controller.js';

const router = Router();
router.get('/home', discoveryHome);
router.get('/search', globalSearch);

export default router;
