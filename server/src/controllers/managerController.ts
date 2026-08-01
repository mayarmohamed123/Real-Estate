import type { Request, Response } from "express";
import { wktToGeoJSON } from "@terraformer/wkt";
import prisma from "../prisma.js";

export const getManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const manager = await prisma.manager.findUnique({
      where: { cognitoId: cognitoId as string },
    });

    if (manager) {
      res.json(manager);
    } else {
      res.status(404).json({
        message: "Manager Not Found",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      message: `Error retrieving manager: ${error.message}`,
    });
  }
};

export const createManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId, name, email, phoneNumber } = req.body;
    const manager = await prisma.manager.create({
      data: {
        cognitoId,
        name,
        email,
        phoneNumber,
      },
    });

    res.status(201).json(manager);
  } catch (error: any) {
    res.status(500).json({
      message: `Error creating manager: ${error.message}`,
    });
  }
};

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
  } catch (error: any) {
    if (error?.code === "P2025") {
      res.status(404).json({ message: "Manager Not Found" });
      return;
    }

    res.status(500).json({
      message: `Error updating manager: ${error.message}`,
    });
  }
};

export const getManagerProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;

    const properties = await prisma.property.findMany({
      where: { managerCognitoId: cognitoId as string },
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
      message: `Error retrieving manager properties: ${error.message}`,
    });
  }
};
