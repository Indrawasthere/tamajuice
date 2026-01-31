import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller.js';
import { auth, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', auth, getProducts);
router.get('/:id', auth, getProductById);
router.post('/', auth, authorize('ADMIN'), createProduct);
router.put('/:id', auth, authorize('ADMIN'), updateProduct);
router.delete('/:id', auth, authorize('ADMIN'), deleteProduct);

export default router;
