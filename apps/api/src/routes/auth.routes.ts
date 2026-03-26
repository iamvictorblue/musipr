import { Router } from 'express';
import { forgotPasswordHandler, loginHandler, logoutHandler, refreshHandler, signupHandler } from '../controllers/auth.controller.js';

const router = Router();
router.post('/signup', signupHandler);
router.post('/login', loginHandler);
router.post('/refresh', refreshHandler);
router.post('/logout', logoutHandler);
router.post('/forgot-password', forgotPasswordHandler);

export default router;
