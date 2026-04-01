import { Router } from 'express';
import authRoutes from './auth.routes.js';
import verificationRoutes from './verification.routes.js';
import trackRoutes from './track.routes.js';
import uploadRoutes from './upload.routes.js';
import discoveryRoutes from './discovery.routes.js';
import adminRoutes from './admin.routes.js';
import artistRoutes from './artists.routes.js';
import playlistRoutes from './playlists.routes.js';
import releaseRoutes from './releases.routes.js';
import eventRoutes from './events.routes.js';
import merchRoutes from './merch.routes.js';
import userRoutes from './users.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/verification', verificationRoutes);
router.use('/tracks', trackRoutes);
router.use('/uploads', uploadRoutes);
router.use('/discovery', discoveryRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);
router.use('/artists', artistRoutes);
router.use('/playlists', playlistRoutes);
router.use('/releases', releaseRoutes);
router.use('/events', eventRoutes);
router.use('/merch', merchRoutes);
router.use('/reports', Router());

export default router;
