import express from "express";
import {
  createApplication,
  deleteApplication,
  getApplication,
  listApplications,
  updateApplicationStatus,
} from "../controllers/applicationController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.get("/",authMiddleware(["tenant", "manager"]), listApplications);
router.get("/:id",authMiddleware(["tenant", "manager"]), getApplication);
router.post("/", authMiddleware(["tenant"]),createApplication);
router.put("/:id/status", authMiddleware(["manager"]),updateApplicationStatus);
router.delete("/:id", authMiddleware(["manager"]),deleteApplication);

export default router;
