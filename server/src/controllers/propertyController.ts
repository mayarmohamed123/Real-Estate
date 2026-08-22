import type { Request, Response } from "express";
import { Amenity, Highlight, Prisma } from "../generated/prisma/client.js";
// @ts-ignore - no official @types package available for @terraformer/wkt
import { wktToGeoJSON } from "@terraformer/wkt";
import prisma from "../prisma.js";
import { Upload } from "@aws-sdk/lib-storage";
import { DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import axios from "axios";
import { randomUUID } from "crypto";
import path from "path";
import { z } from "zod";

// ── S3 Client ─────────────────────────────────────────────────────────────────
const s3Client = new S3Client(
  process.env.AWS_REGION ? { region: process.env.AWS_REGION } : {}
);

// ── Shared Error Handler ──────────────────────────────────────────────────────
function serverError(res: Response, error: unknown, context: string): void {
  console.error(`[${context}]`, error);
  res.status(500).json({ message: "An unexpected error occurred. Please try again." });
}

// ── Boolean string coercion (multipart/form-data sends strings) ──────────────
const boolFromString = z.preprocess(
  (v) => v === "true" || v === true,
  z.boolean()
);

// ── Validation schemas ────────────────────────────────────────────────────────
const VALID_PROPERTY_TYPES = [
  "Rooms",
  "Tinyhouse",
  "Apartment",
  "Villa",
  "Townhouse",
  "Cottage",
] as const;

const createPropertySchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().min(1, "Description is required").max(5000),
  pricePerMonth: z.coerce.number().positive("Must be a positive number"),
  securityDeposit: z.coerce.number().nonnegative(),
  applicationFee: z.coerce.number().nonnegative(),
  beds: z.coerce.number().int().min(0),
  baths: z.coerce.number().min(0),
  squareFeet: z.coerce.number().int().positive(),
  propertyType: z.enum(VALID_PROPERTY_TYPES),
  isPetsAllowed: boolFromString.default(false),
  isParkingIncluded: boolFromString.default(false),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().min(1, "Postal code is required"),
});

const updatePropertySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  pricePerMonth: z.coerce.number().positive().optional(),
  securityDeposit: z.coerce.number().nonnegative().optional(),
  applicationFee: z.coerce.number().nonnegative().optional(),
  beds: z.coerce.number().int().min(0).optional(),
  baths: z.coerce.number().min(0).optional(),
  squareFeet: z.coerce.number().int().positive().optional(),
  propertyType: z.enum(VALID_PROPERTY_TYPES).optional(),
  isPetsAllowed: boolFromString.optional(),
  isParkingIncluded: boolFromString.optional(),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Delete objects from S3. Errors are logged but not re-thrown (best-effort). */
async function deleteS3Objects(urls: string[]): Promise<void> {
  if (!urls.length || !process.env.AWS_S3_BUCKET_NAME) return;
  try {
    await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Delete: {
          Objects: urls.map((url) => ({
            Key: new URL(url).pathname.slice(1), // strip leading "/"
          })),
          Quiet: true,
        },
      })
    );
  } catch (err) {
    console.error("[deleteS3Objects] Failed to delete S3 objects:", err);
  }
}

/** Parse WKT point to { latitude, longitude }. Returns zeroes if invalid. */
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

// ── GET /properties ───────────────────────────────────────────────────────────
export const getProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      favoriteIds,
      priceMin,
      priceMax,
      beds,
      baths,
      propertyType,
      squareFeetMin,
      squareFeetMax,
      amenities,
      availableFrom,
      latitude,
      longitude,
      managerCognitoId,
    } = req.query;

    const whereConditions: Prisma.Sql[] = [];

    if (managerCognitoId) {
      whereConditions.push(
        Prisma.sql`p."managerCognitoId" = ${String(managerCognitoId)}`
      );
    }
    if (priceMin) {
      whereConditions.push(Prisma.sql`p."pricePerMonth" >= ${Number(priceMin)}`);
    }
    if (priceMax) {
      whereConditions.push(Prisma.sql`p."pricePerMonth" <= ${Number(priceMax)}`);
    }
    if (beds && beds !== "any") {
      whereConditions.push(Prisma.sql`p."beds" >= ${Number(beds)}`);
    }
    if (baths && baths !== "any") {
      whereConditions.push(Prisma.sql`p."baths" >= ${Number(baths)}`);
    }
    if (propertyType && propertyType !== "any") {
      whereConditions.push(
        Prisma.sql`p."propertyType"::text = ${String(propertyType)}`
      );
    }
    if (squareFeetMin) {
      whereConditions.push(Prisma.sql`p."squareFeet" >= ${Number(squareFeetMin)}`);
    }
    if (squareFeetMax) {
      whereConditions.push(Prisma.sql`p."squareFeet" <= ${Number(squareFeetMax)}`);
    }
    if (amenities && amenities !== "any") {
      const amenitiesArray = Array.isArray(amenities)
        ? (amenities as string[])
        : (amenities as string).split(",");
      if (amenitiesArray.length > 0) {
        whereConditions.push(
          Prisma.sql`p."amenities"::text[] @> ${amenitiesArray}::text[]`
        );
      }
    }
    if (availableFrom && availableFrom !== "any") {
      const timestamp = isNaN(Number(availableFrom))
        ? Date.parse(availableFrom as string)
        : Number(availableFrom);
      if (!isNaN(timestamp)) {
        const availableDate = new Date(timestamp);
        whereConditions.push(
          Prisma.sql`NOT EXISTS (
            SELECT 1 FROM "Lease" l
            WHERE l."propertyId" = p.id
            AND l."startDate" <= ${availableDate}
          )`
        );
      }
    }
    if (favoriteIds) {
      const ids = Array.isArray(favoriteIds)
        ? favoriteIds.map(Number)
        : (favoriteIds as string).split(",").map(Number).filter((id) => !isNaN(id));
      if (ids.length > 0) {
        whereConditions.push(Prisma.sql`p.id IN (${Prisma.join(ids)})`);
      }
    }
    if (latitude && longitude) {
      const lat = Number(latitude);
      const lng = Number(longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        whereConditions.push(
          Prisma.sql`ST_DWithin(
            l.coordinates,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
            50000
          )`
        );
      }
    }

    const whereClause =
      whereConditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(whereConditions, " AND ")}`
        : Prisma.empty;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const properties = await prisma.$queryRaw<any[]>`
      SELECT
        p.*,
        json_build_object(
          'id', l.id,
          'address', l.address,
          'city', l.city,
          'state', l.state,
          'country', l.country,
          'postalCode', l."postalCode",
          'coordinates', ST_AsGeoJSON(l.coordinates)::json
        ) as location
      FROM "Property" p
      JOIN "Location" l ON p."locationId" = l.id
      ${whereClause}
      ORDER BY p.id DESC
    `;

    res.json(properties);
  } catch (error) {
    serverError(res, error, "getProperties");
  }
};

// ── GET /properties/:id ───────────────────────────────────────────────────────
export const getProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: "Property ID must be a valid number" });
      return;
    }

    const property = await prisma.property.findUnique({
      where: { id },
      include: { location: true },
    });

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    const locationCoordinates = await prisma.$queryRaw<
      Array<{ coordinates: string }>
    >`
      SELECT ST_AsText(coordinates) as coordinates
      FROM "Location"
      WHERE id = ${property.locationId}
    `;

    const { latitude, longitude } = parseWktCoordinates(
      locationCoordinates[0]?.coordinates
    );

    res.json({
      ...property,
      location: {
        ...property.location,
        coordinates: { latitude, longitude },
      },
    });
  } catch (error) {
    serverError(res, error, "getProperty");
  }
};

// ── POST /properties ──────────────────────────────────────────────────────────
export const createProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  // 1. Auth guard — managerCognitoId comes from the verified JWT
  const managerCognitoId = req.user?.id;
  if (!managerCognitoId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  // 2. Parse & validate the multipart form body
  const parsed = createPropertySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Validation error",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const {
    name, description, pricePerMonth, securityDeposit, applicationFee,
    isPetsAllowed, isParkingIncluded, beds, baths, squareFeet, propertyType,
    address, city, state, country, postalCode,
  } = parsed.data;

  // Parse enum arrays (sent as JSON strings from multipart)
  const rawAmenities = req.body.amenities;
  const rawHighlights = req.body.highlights;
  let parsedAmenities: string[] = [];
  let parsedHighlights: string[] = [];
  try {
    parsedAmenities =
      typeof rawAmenities === "string" ? JSON.parse(rawAmenities) : (rawAmenities ?? []);
    parsedHighlights =
      typeof rawHighlights === "string" ? JSON.parse(rawHighlights) : (rawHighlights ?? []);
  } catch {
    res.status(400).json({ message: "Invalid amenities or highlights format" });
    return;
  }

  // 3. Upload photos to S3
  const files = req.files as Express.Multer.File[];
  let photoUrls: string[] = [];

  try {
    photoUrls = await Promise.all(
      (files ?? []).map(async (file) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const key = `properties/${randomUUID()}${ext}`;
        const upload = new Upload({
          client: s3Client,
          params: {
            Bucket: process.env.AWS_S3_BUCKET_NAME ?? "",
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
          },
        });
        const result = await upload.done();
        return result.Location ?? "";
      })
    );
  } catch (error) {
    serverError(res, error, "createProperty:s3Upload");
    return;
  }

  // 4. Geocode address
  let lat = 0;
  let lng = 0;
  try {
    const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
      street: address,
      city,
      country,
      postalcode: postalCode,
      format: "json",
      limit: "1",
    }).toString()}`;

    const geocodingResponse = await axios.get(geocodingUrl, {
      headers: { "User-Agent": "RealEstateApp (contact@realestate.app)" },
      timeout: 5000,
    });

    const geoData = geocodingResponse.data;
    if (Array.isArray(geoData) && geoData.length > 0) {
      lat = parseFloat(geoData[0].lat);
      lng = parseFloat(geoData[0].lon);
    }
  } catch (geoErr) {
    // Non-fatal: geocoding failure stores (0,0) coordinates
    console.warn("[createProperty] Geocoding failed:", geoErr);
  }

  // 5. Create Location + Property in a transaction (atomic — no orphaned rows)
  try {
    const property = await prisma.$transaction(async (tx) => {
      const locationResult = await tx.$queryRaw<Array<{ id: number }>>`
        INSERT INTO "Location" ("address", "city", "state", "country", "postalCode", "coordinates")
        VALUES (
          ${address},
          ${city},
          ${state},
          ${country},
          ${postalCode},
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        )
        RETURNING id
      `;

      const locationId = locationResult[0]?.id;
      if (!locationId) throw new Error("Failed to create location record");

      return tx.property.create({
        data: {
          name, description,
          pricePerMonth, securityDeposit, applicationFee,
          isPetsAllowed, isParkingIncluded,
          beds, baths, squareFeet,
          propertyType,
          amenities: parsedAmenities as Amenity[],
          highlights: parsedHighlights as Highlight[],
          photoUrls,
          locationId,
          managerCognitoId,
        },
        include: { location: true },
      });
    });

    res.status(201).json(property);
  } catch (error) {
    // Clean up uploaded S3 objects if the DB transaction fails
    if (photoUrls.length > 0) {
      await deleteS3Objects(photoUrls);
    }
    serverError(res, error, "createProperty:db");
  }
};

// ── PUT /properties/:id ───────────────────────────────────────────────────────
export const updateProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: "Property ID must be a valid number" });
      return;
    }

    // Validate input
    const parsed = updatePropertySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation error",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    // Authorization — only the owning manager may update
    const existing = await prisma.property.findUnique({
      where: { id },
      select: { managerCognitoId: true },
    });

    if (!existing) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    if (existing.managerCognitoId !== req.user?.id) {
      res.status(403).json({ message: "Forbidden: you do not own this property" });
      return;
    }

    const { name, description, pricePerMonth, securityDeposit, applicationFee,
      isPetsAllowed, isParkingIncluded, beds, baths, squareFeet, propertyType } =
      parsed.data;

    // Parse enum arrays from request body (optional)
    const rawAmenities = req.body.amenities;
    const rawHighlights = req.body.highlights;

    const updated = await prisma.property.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(pricePerMonth !== undefined && { pricePerMonth }),
        ...(securityDeposit !== undefined && { securityDeposit }),
        ...(applicationFee !== undefined && { applicationFee }),
        ...(isPetsAllowed !== undefined && { isPetsAllowed }),
        ...(isParkingIncluded !== undefined && { isParkingIncluded }),
        ...(beds !== undefined && { beds }),
        ...(baths !== undefined && { baths }),
        ...(squareFeet !== undefined && { squareFeet }),
        ...(propertyType !== undefined && { propertyType }),
        ...(rawAmenities !== undefined && {
          amenities:
            typeof rawAmenities === "string" ? JSON.parse(rawAmenities) : rawAmenities,
        }),
        ...(rawHighlights !== undefined && {
          highlights:
            typeof rawHighlights === "string" ? JSON.parse(rawHighlights) : rawHighlights,
        }),
      },
      include: { location: true },
    });

    res.json(updated);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.code === "P2025") {
      res.status(404).json({ message: "Property not found" });
      return;
    }
    serverError(res, error, "updateProperty");
  }
};

// ── DELETE /properties/:id ────────────────────────────────────────────────────
export const deleteProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: "Property ID must be a valid number" });
      return;
    }

    // Fetch property first to check ownership and get photo URLs for cleanup
    const property = await prisma.property.findUnique({
      where: { id },
      select: { managerCognitoId: true, photoUrls: true },
    });

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    // Authorization — only the owning manager may delete
    if (property.managerCognitoId !== req.user?.id) {
      res.status(403).json({ message: "Forbidden: you do not own this property" });
      return;
    }

    // Delete property from DB
    await prisma.property.delete({ where: { id } });

    // Best-effort: clean up S3 photos after DB deletion succeeds
    if (property.photoUrls.length > 0) {
      await deleteS3Objects(property.photoUrls);
    }

    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.code === "P2025") {
      res.status(404).json({ message: "Property not found" });
      return;
    }
    serverError(res, error, "deleteProperty");
  }
};
