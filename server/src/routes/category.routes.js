import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js';
import { auth, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', auth, getCategories);
router.get('/:id', auth, getCategoryById);
router.post('/', auth, authorize('ADMIN'), createCategory);
router.put('/:id', auth, authorize('ADMIN'), updateCategory);
router.delete('/:id', auth, authorize('ADMIN'), deleteCategory);

export default router;
