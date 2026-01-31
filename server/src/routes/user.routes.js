import express from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/user.controller.js';
import { auth, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', auth, authorize('ADMIN'), getUsers);
router.post('/', auth, authorize('ADMIN'), createUser);
router.put('/:id', auth, authorize('ADMIN'), updateUser);
router.delete('/:id', auth, authorize('ADMIN'), deleteUser);

export default router;
