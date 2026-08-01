import express from "express";
import multer from "multer";
import { authMiddleware } from "../Middleware/authMiddleware.js";
import {
  getProperties,
  getProperty,
  createProperty,
} from "../controllers/propertyController.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.get("/", getProperties);
router.get("/:id", getProperty);
router.post(
  "/",
  authMiddleware(["manager"]),
  upload.array("photos"),
  createProperty
);

export default router;
