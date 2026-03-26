import { Router } from 'express';
import authRoutes from './auth.routes.js';
import verificationRoutes from './verification.routes.js';
import trackRoutes from './track.routes.js';
import uploadRoutes from './upload.routes.js';
import discoveryRoutes from './discovery.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/verification', verificationRoutes);
router.use('/tracks', trackRoutes);
router.use('/uploads', uploadRoutes);
router.use('/discovery', discoveryRoutes);
router.use('/admin', adminRoutes);
router.use('/users', Router());
router.use('/artists', Router());
router.use('/playlists', Router());
router.use('/releases', Router());
router.use('/events', Router());
router.use('/merch', Router());
router.use('/reports', Router());

export default router;
