import express from "express";
import {
  createLease,
  deleteLease,
  getLease,
  getLeasePayments,
  getLeases,
  updateLease,
} from "../controllers/leaseController.js";

const router = express.Router();

router.get("/", getLeases);
router.get("/:id", getLease);
router.post("/", createLease);
router.put("/:id", updateLease);
router.delete("/:id", deleteLease);
router.get("/:id/payments", getLeasePayments);

export default router;
