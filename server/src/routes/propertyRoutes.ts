import express from "express";
import multer from "multer";
import { authMiddleware } from "../Middleware/authMiddleware.js";
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
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
router.put("/:id", authMiddleware(["manager"]), updateProperty);
router.delete("/:id", authMiddleware(["manager"]), deleteProperty);

export default router;
