import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../prisma.js";

// ── Shared Error Handler ──────────────────────────────────────────────────────
function serverError(res: Response, error: unknown, context: string): void {
  console.error(`[${context}]`, error);
  res.status(500).json({ message: "An unexpected error occurred. Please try again." });
}

// ── GET /leases ───────────────────────────────────────────────────────────────
// Scoped by the requesting user's role to prevent data leakage.
export const getLeases = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { role, id: userId } = req.user!; // set by authMiddleware
    const { tenantCognitoId } = req.query;

    let where: Prisma.LeaseWhereInput;

    if (role === "tenant") {
      // Tenants can only see their own leases
      where = { tenantCognitoId: userId };
    } else if (role === "manager") {
      // Managers see leases for properties they own
      where = {
        property: { managerCognitoId: userId },
        // Optional: filter to a specific tenant
        ...(tenantCognitoId ? { tenantCognitoId: String(tenantCognitoId) } : {}),
      };
    } else {
      res.status(403).json({ message: "Access Denied" });
      return;
    }

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
  } catch (error) {
    serverError(res, error, "getLeases");
  }
};

// ── GET /leases/:id ───────────────────────────────────────────────────────────
export const getLease = async (req: Request, res: Response): Promise<void> => {
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

    // Authorization — tenant can only view their own lease; manager must own the property
    const { role, id: userId } = req.user!;
    const isAuthorized =
      role === "tenant"
        ? lease.tenantCognitoId === userId
        : lease.property.managerCognitoId === userId;

    if (!isAuthorized) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    res.json(lease);
  } catch (error) {
    serverError(res, error, "getLease");
  }
};

// ── POST /leases ──────────────────────────────────────────────────────────────
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
      include: { tenant: true, property: true },
    });

    res.status(201).json(lease);
  } catch (error) {
    serverError(res, error, "createLease");
  }
};

// ── PUT /leases/:id ───────────────────────────────────────────────────────────
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
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.code === "P2025") {
      res.status(404).json({ message: "Lease not found" });
      return;
    }
    serverError(res, error, "updateLease");
  }
};

// ── DELETE /leases/:id ────────────────────────────────────────────────────────
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
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.code === "P2025") {
      res.status(404).json({ message: "Lease not found" });
      return;
    }
    serverError(res, error, "deleteLease");
  }
};

// ── GET /leases/:id/payments ──────────────────────────────────────────────────
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

    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      select: { tenantCognitoId: true, property: { select: { managerCognitoId: true } } },
    });

    if (!lease) {
      res.status(404).json({ message: "Lease not found" });
      return;
    }

    const { role, id: userId } = req.user!;
    const isAuthorized =
      role === "tenant"
        ? lease.tenantCognitoId === userId
        : lease.property.managerCognitoId === userId;

    if (!isAuthorized) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const payments = await prisma.payment.findMany({
      where: { leaseId },
      orderBy: { dueDate: "desc" },
    });

    res.json(payments);
  } catch (error) {
    serverError(res, error, "getLeasePayments");
  }
};
