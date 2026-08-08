import type { Request, Response } from "express";
import prisma from "../prisma.js";

export const getLeases = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tenantCognitoId } = req.query;

    const where = tenantCognitoId
      ? { tenantCognitoId: String(tenantCognitoId) }
      : {};

    const leases = await prisma.lease.findMany({
      where,
      include: {
        tenant: true,
        property: { include: { location: true } },
        payments: { orderBy: { dueDate: "desc" } },
      },
      orderBy: { startDate: "desc" },
    });

    res.json(leases);
  } catch (error: any) {
    res.status(500).json({
      message: `Error retrieving leases: ${error.message}`,
    });
  }
};

export const getLease = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ message: "Lease ID must be a valid number" });
      return;
    }

    const lease = await prisma.lease.findUnique({
      where: { id },
      include: {
        tenant: true,
        property: { include: { location: true } },
        payments: { orderBy: { dueDate: "desc" } },
        application: true,
      },
    });

    if (!lease) {
      res.status(404).json({ message: "Lease not found" });
      return;
    }

    res.json(lease);
  } catch (error: any) {
    res.status(500).json({
      message: `Error retrieving lease: ${error.message}`,
    });
  }
};

export const createLease = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { startDate, endDate, rent, deposit, propertyId, tenantCognitoId } =
      req.body;

    const lease = await prisma.lease.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rent: Number(rent),
        deposit: Number(deposit),
        propertyId: Number(propertyId),
        tenantCognitoId,
      },
      include: {
        tenant: true,
        property: true,
      },
    });

    res.status(201).json(lease);
  } catch (error: any) {
    res.status(500).json({
      message: `Error creating lease: ${error.message}`,
    });
  }
};

export const updateLease = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ message: "Lease ID must be a valid number" });
      return;
    }

    const { startDate, endDate, rent, deposit } = req.body;

    const updated = await prisma.lease.update({
      where: { id },
      data: {
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) }),
        ...(rent !== undefined && { rent: Number(rent) }),
        ...(deposit !== undefined && { deposit: Number(deposit) }),
      },
      include: { tenant: true, property: true },
    });

    res.json(updated);
  } catch (error: any) {
    if (error?.code === "P2025") {
      res.status(404).json({ message: "Lease not found" });
      return;
    }
    res.status(500).json({
      message: `Error updating lease: ${error.message}`,
    });
  }
};

export const deleteLease = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ message: "Lease ID must be a valid number" });
      return;
    }

    await prisma.lease.delete({ where: { id } });

    res.json({ message: "Lease deleted successfully" });
  } catch (error: any) {
    if (error?.code === "P2025") {
      res.status(404).json({ message: "Lease not found" });
      return;
    }
    res.status(500).json({
      message: `Error deleting lease: ${error.message}`,
    });
  }
};

export const getLeasePayments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const leaseId = Number(req.params.id);

    if (isNaN(leaseId)) {
      res.status(400).json({ message: "Lease ID must be a valid number" });
      return;
    }

    const lease = await prisma.lease.findUnique({ where: { id: leaseId } });

    if (!lease) {
      res.status(404).json({ message: "Lease not found" });
      return;
    }

    const payments = await prisma.payment.findMany({
      where: { leaseId },
      orderBy: { dueDate: "desc" },
    });

    res.json(payments);
  } catch (error: any) {
    res.status(500).json({
      message: `Error retrieving lease payments: ${error.message}`,
    });
  }
};
