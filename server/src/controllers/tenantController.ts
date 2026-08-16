import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { wktToGeoJSON } from "@terraformer/wkt";
import prisma from "../prisma.js";

// ── Shared Error Handler ──────────────────────────────────────────────────────
function serverError(res: Response, error: unknown, context: string): void {
  console.error(`[${context}]`, error);
  res.status(500).json({ message: "An unexpected error occurred. Please try again." });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Parse WKT POINT string → { latitude, longitude }. Returns zeroes on failure. */
function parseWktCoordinates(wkt: string | undefined): {
  latitude: number;
  longitude: number;
} {
  if (!wkt) return { latitude: 0, longitude: 0 };
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geojson = wktToGeoJSON(wkt) as any;
    if (geojson?.coordinates) {
      return { longitude: geojson.coordinates[0], latitude: geojson.coordinates[1] };
    }
  } catch {
    // fall through
  }
  return { latitude: 0, longitude: 0 };
}

/**
 * Batch-fetch WKT coordinates for a list of location IDs in ONE query.
 * Avoids the N+1 problem of querying each location's coordinates separately.
 */
async function batchFetchCoordinates(
  locationIds: number[]
): Promise<Map<number, { latitude: number; longitude: number }>> {
  if (locationIds.length === 0) return new Map();

  const uniqueIds = [...new Set(locationIds)];

  const rows = await prisma.$queryRaw<Array<{ id: number; coordinates: string }>>`
    SELECT id, ST_AsText(coordinates) as coordinates
    FROM "Location"
    WHERE id = ANY(ARRAY[${Prisma.join(uniqueIds)}]::int[])
  `;

  const map = new Map<number, { latitude: number; longitude: number }>();
  for (const row of rows) {
    map.set(row.id, parseWktCoordinates(row.coordinates));
  }
  return map;
}

// ── GET /tenants/:cognitoId ───────────────────────────────────────────────────
export const getTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { cognitoId: cognitoId as string },
      include: { favorites: true },
    });

    if (!tenant) {
      res.status(404).json({ message: "Tenant not found" });
      return;
    }

    res.json(tenant);
  } catch (error) {
    serverError(res, error, "getTenant");
  }
};

// ── POST /tenants ─────────────────────────────────────────────────────────────
export const createTenant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId, name, email, phoneNumber } = req.body;

    const tenant = await prisma.tenant.create({
      data: { cognitoId, name, email, phoneNumber },
    });

    res.status(201).json(tenant);
  } catch (error) {
    serverError(res, error, "createTenant");
  }
};

// ── PUT /tenants/:cognitoId ───────────────────────────────────────────────────
export const updateTenant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const { name, email, phoneNumber } = req.body;

    const updatedTenant = await prisma.tenant.update({
      where: { cognitoId: cognitoId as string },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phoneNumber !== undefined && { phoneNumber }),
      },
    });

    res.json(updatedTenant);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.code === "P2025") {
      res.status(404).json({ message: "Tenant not found" });
      return;
    }
    serverError(res, error, "updateTenant");
  }
};

// ── GET /tenants/:cognitoId/current-residences ────────────────────────────────
// Fixed: was N+1 (one query per property for coordinates).
// Now uses a single batch query for all location coordinates.
export const getCurrentResidences = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;

    const properties = await prisma.property.findMany({
      where: {
        tenants: { some: { cognitoId: cognitoId as string } },
      },
      include: { location: true },
    });

    if (properties.length === 0) {
      res.json([]);
      return;
    }

    // Single batch query — no more N+1
    const coordMap = await batchFetchCoordinates(
      properties.map((p) => p.locationId)
    );

    const formatted = properties.map((property) => ({
      ...property,
      location: {
        ...property.location,
        coordinates: coordMap.get(property.locationId) ?? { latitude: 0, longitude: 0 },
      },
    }));

    res.json(formatted);
  } catch (error) {
    serverError(res, error, "getCurrentResidences");
  }
};

// ── POST /tenants/:cognitoId/favorites ────────────────────────────────────────
export const addFavoriteProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const propertyId = Number(req.body.propertyId);

    if (isNaN(propertyId)) {
      res.status(400).json({ message: "propertyId must be a valid number" });
      return;
    }

    const tenant = await prisma.tenant.update({
      where: { cognitoId: cognitoId as string },
      data: { favorites: { connect: { id: propertyId } } },
      include: { favorites: true },
    });

    res.json(tenant);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.code === "P2025") {
      res.status(404).json({ message: "Tenant or property not found" });
      return;
    }
    serverError(res, error, "addFavoriteProperty");
  }
};

// ── DELETE /tenants/:cognitoId/favorites ──────────────────────────────────────
export const removeFavoriteProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const propertyId = Number(req.body.propertyId);

    if (isNaN(propertyId)) {
      res.status(400).json({ message: "propertyId must be a valid number" });
      return;
    }

    const tenant = await prisma.tenant.update({
      where: { cognitoId: cognitoId as string },
      data: { favorites: { disconnect: { id: propertyId } } },
      include: { favorites: true },
    });

    res.json(tenant);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.code === "P2025") {
      res.status(404).json({ message: "Tenant or property not found" });
      return;
    }
    serverError(res, error, "removeFavoriteProperty");
  }
};
