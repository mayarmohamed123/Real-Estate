import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
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
 * Batch-fetch WKT coordinates for a list of location IDs in a single query.
 * This avoids the N+1 pattern of querying each location individually.
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

// ── GET /managers/:cognitoId ──────────────────────────────────────────────────
export const getManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;

    const manager = await prisma.manager.findUnique({
      where: { cognitoId: cognitoId as string },
    });

    if (!manager) {
      res.status(404).json({ message: "Manager not found" });
      return;
    }

    res.json(manager);
  } catch (error) {
    serverError(res, error, "getManager");
  }
};

// ── POST /managers ────────────────────────────────────────────────────────────
export const createManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId, name, email, phoneNumber } = req.body;

    const manager = await prisma.manager.create({
      data: { cognitoId, name, email, phoneNumber },
    });

    res.status(201).json(manager);
  } catch (error) {
    serverError(res, error, "createManager");
  }
};

// ── PUT /managers/:cognitoId ──────────────────────────────────────────────────
export const updateManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const { name, email, phoneNumber } = req.body;

    const updatedManager = await prisma.manager.update({
      where: { cognitoId: cognitoId as string },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phoneNumber !== undefined && { phoneNumber }),
      },
    });

    res.json(updatedManager);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.code === "P2025") {
      res.status(404).json({ message: "Manager not found" });
      return;
    }
    serverError(res, error, "updateManager");
  }
};

// ── GET /managers/:cognitoId/properties ───────────────────────────────────────
// Fixed: was N+1 (one DB query per property for coordinates).
// Now does a single batch query for all location coordinates.
export const getManagerProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;

    const properties = await prisma.property.findMany({
      where: { managerCognitoId: cognitoId as string },
      include: { location: true },
    });

    if (properties.length === 0) {
      res.json([]);
      return;
    }

    // Single batch query for all coordinates (was N+1 before)
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
    serverError(res, error, "getManagerProperties");
  }
};
