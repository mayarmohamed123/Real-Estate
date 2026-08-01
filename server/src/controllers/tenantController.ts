import type { Request, Response } from "express";
import { wktToGeoJSON } from "@terraformer/wkt";
import prisma from "../prisma.js";

export const getTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const tenant = await prisma.tenant.findUnique({
      where: { cognitoId: cognitoId as string },
      include: {
        favorites: true,
      },
    });

    if (tenant) {
      res.json(tenant);
    } else {
      res.status(404).json({
        message: "Tenant Not Found",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      message: `Error retreieving tenant: ${error.message}`,
    });
  }
};

export const createTenant = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { cognitoId, name, email, phoneNumber } = req.body;
    const tenant = await prisma.tenant.create({
      data: {
        cognitoId,
        name,
        email,
        phoneNumber,
      },
    });

    res.status(201).json(tenant);
  } catch (error: any) {
    res.status(500).json({
      message: `Error retreieving tenant: ${error.message}`,
    });
  }
};

export const updateTenant = async (
  req: Request,
  res: Response,
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
  } catch (error: any) {
    if (error?.code === "P2025") {
      res.status(404).json({ message: "Tenant Not Found" });
      return;
    }

    res.status(500).json({
      message: `Error updating tenant: ${error.message}`,
    });
  }
};

export const getCurrentResidences = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;

    const properties = await prisma.property.findMany({
      where: {
        tenants: {
          some: {
            cognitoId: cognitoId as string,
          },
        },
      },
      include: {
        location: true,
      },
    });

    const formattedProperties = await Promise.all(
      properties.map(async (property) => {
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

        return {
          ...property,
          location: {
            ...property.location,
            coordinates: {
              latitude,
              longitude,
            },
          },
        };
      })
    );

    res.json(formattedProperties);
  } catch (error: any) {
    res.status(500).json({
      message: `Error retrieving tenant residences: ${error.message}`,
    });
  }
};

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
      data: {
        favorites: {
          connect: { id: propertyId },
        },
      },
      include: {
        favorites: true,
      },
    });

    res.json(tenant);
  } catch (error: any) {
    res.status(500).json({
      message: `Error adding favorite property: ${error.message}`,
    });
  }
};

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
      data: {
        favorites: {
          disconnect: { id: propertyId },
        },
      },
      include: {
        favorites: true,
      },
    });

    res.json(tenant);
  } catch (error: any) {
    res.status(500).json({
      message: `Error removing favorite property: ${error.message}`,
    });
  }
};
