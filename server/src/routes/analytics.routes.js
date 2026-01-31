import express from "express";
import {
  getDashboardStats,
  getSalesChart,
  getTopProducts,
  getPaymentMethodStats,
} from "../controllers/analytics.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/dashboard", auth, getDashboardStats);
router.get("/sales-chart", auth, getSalesChart);
router.get("/top-products", auth, getTopProducts);
router.get("/payment-methods", auth, getPaymentMethodStats);

export default router;
