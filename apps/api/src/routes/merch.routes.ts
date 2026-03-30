import { Router } from 'express';
import { listMerch } from '../controllers/catalog.controller.js';

const router = Router();

router.get('/', listMerch);

export default router;
