import express from "express";
import {
  getOrders,
  getOrderById,
  createOrder,
  printOrderReceipt,
  cancelOrder,
} from "../controllers/order.controller.js";
import { auth, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", auth, getOrders);
router.get("/:id", auth, getOrderById);
router.post("/", auth, createOrder);
router.post("/:id/print", auth, printOrderReceipt);
router.put("/:id/cancel", auth, authorize("ADMIN"), cancelOrder);

export default router;
