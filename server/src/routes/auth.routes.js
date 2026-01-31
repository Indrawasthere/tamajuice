import express from 'express';
import { login, me, changePassword } from '../controllers/auth.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', auth, me);
router.post('/change-password', auth, changePassword);

export default router;
