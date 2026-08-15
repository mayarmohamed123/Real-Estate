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

// ── Multer — memory storage with security limits ──────────────────────────────
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 10,                   // max 10 files per request
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP, and AVIF images are allowed"));
    }
  },
});

// ── Routes ────────────────────────────────────────────────────────────────────
const router = express.Router();

router.get("/", getProperties);
router.get("/:id", getProperty);
router.post("/", authMiddleware(["manager"]), upload.array("photos"), createProperty);
router.put("/:id", authMiddleware(["manager"]), updateProperty);
router.delete("/:id", authMiddleware(["manager"]), deleteProperty);

export default router;
