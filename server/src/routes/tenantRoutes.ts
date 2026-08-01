import express from "express";
import {
  addFavoriteProperty,
  createTenant,
  getCurrentResidences,
  getTenant,
  removeFavoriteProperty,
  updateTenant,
} from "../controllers/tenantController.js";

const router = express.Router();

router.get("/:cognitoId", getTenant);
router.post("/", createTenant);
router.put("/:cognitoId", updateTenant);
router.get("/:cognitoId/current-residences", getCurrentResidences);

router.post("/:cognitoId/favorites", addFavoriteProperty);
router.delete("/:cognitoId/favorites", removeFavoriteProperty);

export default router;
