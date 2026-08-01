import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";
import prisma from "../prisma.js";
import { Upload } from "@aws-sdk/lib-storage";
import { S3Client } from "@aws-sdk/client-s3";
import axios from "axios";

// Conditionally pass region to satisfy exactOptionalPropertyTypes
const s3Client = new S3Client(
  process.env.AWS_REGION ? { region: process.env.AWS_REGION } : {}
);

export const getProperties = async (
  req: Request,
  res: Response,
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
    } = req.query;

    let whereConditions: Prisma.Sql[] = [];

    if (priceMin) {
      whereConditions.push(
        Prisma.sql`p."pricePerMonth" >= ${Number(priceMin)}`,
      );
    }

    if (priceMax) {
      whereConditions.push(
        Prisma.sql`p."pricePerMonth" <= ${Number(priceMax)}`,
      );
    }

    if (beds && beds !== "any") {
      whereConditions.push(Prisma.sql`p."beds" >= ${Number(beds)}`);
    }

    if (baths && baths !== "any") {
      whereConditions.push(Prisma.sql`p."baths" >= ${Number(baths)}`);
    }

    if (propertyType && propertyType !== "any") {
      whereConditions.push(
        Prisma.sql`p."propertyType"::text = ${String(propertyType)}`,
      );
    }

    if (squareFeetMin) {
      whereConditions.push(
        Prisma.sql`p."squareFeet" >= ${Number(squareFeetMin)}`,
      );
    }

    if (squareFeetMax) {
      whereConditions.push(
        Prisma.sql`p."squareFeet" <= ${Number(squareFeetMax)}`,
      );
    }

    if (amenities && amenities !== "any") {
      const amenitiesArray = Array.isArray(amenities)
        ? (amenities as string[])
        : (amenities as string).split(",");
      if (amenitiesArray.length > 0) {
        whereConditions.push(
          Prisma.sql`p."amenities"::text[] @> ${amenitiesArray}::text[]`,
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
          )`,
        );
      }
    }

    if (favoriteIds) {
      const ids = Array.isArray(favoriteIds)
        ? favoriteIds.map(Number)
        : (favoriteIds as string)
            .split(",")
            .map(Number)
            .filter((id) => !isNaN(id));
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
          )`,
        );
      }
    }

    const whereClause =
      whereConditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(whereConditions, " AND ")}`
        : Prisma.empty;

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
  } catch (error: any) {
    res.status(500).json({
      message: `Error retrieving properties: ${error.message}`,
    });
  }
};

export const getProperty = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const propertyId = Number(id);

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { location: true },
    });

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    // Retrieve coordinates as WKT text then convert to GeoJSON
    const locationCoordinates = await prisma.$queryRaw<
      Array<{ coordinates: string }>
    >`
      SELECT ST_AsText(coordinates) as coordinates
      FROM "Location"
      WHERE id = ${property.locationId}
    `;

    let latitude = 0;
    let longitude = 0;

    const firstCoord = locationCoordinates[0]?.coordinates;
    if (firstCoord) {
      const geojson = wktToGeoJSON(firstCoord) as any;
      if (geojson && geojson.coordinates) {
        longitude = geojson.coordinates[0];
        latitude = geojson.coordinates[1];
      }
    }

    const formattedProperty = {
      ...property,
      location: {
        ...property.location,
        coordinates: { latitude, longitude },
      },
    };

    res.json(formattedProperty);
  } catch (error: any) {
    res.status(500).json({
      message: `Error retrieving property: ${error.message}`,
    });
  }
};

export const createProperty = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const managerCognitoId = req.user?.id;
    if (!managerCognitoId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const {
      name,
      description,
      pricePerMonth,
      securityDeposit,
      applicationFee,
      isPetsAllowed,
      isParkingIncluded,
      beds,
      baths,
      squareFeet,
      propertyType,
      amenities,
      highlights,
      address,
      city,
      state,
      country,
      postalCode,
    } = req.body;

    // ── 1. Upload photos to S3 from memory ─────────────────────────────────
    const files = req.files as Express.Multer.File[];
    const photoUrls = await Promise.all(
      (files ?? []).map(async (file) => {
        const key = `properties/${Date.now()}_${file.originalname}`;
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
      }),
    );

    // ── 2. Geocode address via Nominatim ────────────────────────────────────
    const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
      {
        street: address,
        city,
        country,
        postalcode: postalCode,
        format: "json",
        limit: "1",
      },
    ).toString()}`;

    const geocodingResponse = await axios.get(geocodingUrl, {
      headers: {
        "User-Agent": "RealEstateApp (contact@realestate.app)",
      },
    });

    const geocodingData = geocodingResponse.data;

    let lat = 0;
    let lng = 0;

    if (Array.isArray(geocodingData) && geocodingData.length > 0) {
      lat = parseFloat(geocodingData[0].lat);
      lng = parseFloat(geocodingData[0].lon);
    }

    // ── 3. Insert Location row with PostGIS point ───────────────────────────
    const locationResult = await prisma.$queryRaw<Array<{ id: number }>>`
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
    if (!locationId) {
      res.status(500).json({ message: "Failed to create location record" });
      return;
    }

    // ── 4. Parse enum arrays from multipart form strings ───────────────────
    const parsedAmenities =
      typeof amenities === "string" ? JSON.parse(amenities) : (amenities ?? []);
    const parsedHighlights =
      typeof highlights === "string"
        ? JSON.parse(highlights)
        : (highlights ?? []);

    // ── 5. Create the Property record ───────────────────────────────────────
    const property = await prisma.property.create({
      data: {
        name,
        description,
        pricePerMonth: Number(pricePerMonth),
        securityDeposit: Number(securityDeposit),
        applicationFee: Number(applicationFee),
        isPetsAllowed: isPetsAllowed === "true" || isPetsAllowed === true,
        isParkingIncluded:
          isParkingIncluded === "true" || isParkingIncluded === true,
        beds: Number(beds),
        baths: Number(baths),
        squareFeet: Number(squareFeet),
        propertyType,
        amenities: parsedAmenities,
        highlights: parsedHighlights,
        photoUrls,
        locationId,
        managerCognitoId,
      },
      include: {
        location: true,
      },
    });

    res.status(201).json(property);
  } catch (error: any) {
    res.status(500).json({
      message: `Error creating property: ${error.message}`,
    });
  }
};
