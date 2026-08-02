import type { Request, Response } from "express";
import prisma from "../prisma.js";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Given a lease, return the next payment due date.
 * Logic: find the latest paid payment date on that lease;
 * if none exists, the next due is one month after the lease start date.
 * Always clamps to the lease end date.
 */
const calculateNextPaymentDate = (
  lease: { startDate: Date; endDate: Date },
  lastPaymentDate: Date | null
): Date | null => {
  const base = lastPaymentDate ?? lease.startDate;
  const next = new Date(base);
  next.setMonth(next.getMonth() + 1);
  if (next > lease.endDate) return null; // lease is over / fully paid
  return next;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /applications
// ─────────────────────────────────────────────────────────────────────────────
export const listApplications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, userType } = req.query;

    const where =
      userType === "tenant"
        ? { tenantCognitoId: String(userId) }
        : userType === "manager"
          ? { property: { managerCognitoId: String(userId) } }
          : {};

    const applications = await prisma.application.findMany({
      where,
      include: {
        property: {
          include: { location: true },
        },
        tenant: true,
        lease: {
          include: { payments: { orderBy: { paymentDate: "desc" }, take: 1 } },
        },
      },
      orderBy: { applicationDate: "desc" },
    });

    const enriched = applications.map((app) => {
      let nextPaymentDate: Date | null = null;

      if (app.lease) {
        const lastPayment = app.lease.payments[0] ?? null;
        nextPaymentDate = calculateNextPaymentDate(
          app.lease,
          lastPayment?.paymentDate ?? null
        );
      }

      return {
        ...app,
        nextPaymentDate,
      };
    });

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({
      message: `Error listing applications: ${error.message}`,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /applications/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ message: "Application ID must be a number" });
      return;
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        property: { include: { location: true } },
        tenant: true,
        lease: {
          include: { payments: { orderBy: { paymentDate: "desc" }, take: 1 } },
        },
      },
    });

    if (!application) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    let nextPaymentDate: Date | null = null;
    if (application.lease) {
      const lastPayment = application.lease.payments[0] ?? null;
      nextPaymentDate = calculateNextPaymentDate(
        application.lease,
        lastPayment?.paymentDate ?? null
      );
    }

    res.json({ ...application, nextPaymentDate });
  } catch (error: any) {
    res.status(500).json({
      message: `Error retrieving application: ${error.message}`,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /applications
// ─────────────────────────────────────────────────────────────────────────────
export const createApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      propertyId,
      tenantCognitoId,
      name,
      email,
      phoneNumber,
      message,
    } = req.body;

    const application = await prisma.application.create({
      data: {
        applicationDate: new Date(),
        status: "Pending",
        propertyId: Number(propertyId),
        tenantCognitoId,
        name,
        email,
        phoneNumber,
        message: message ?? null,
      },
      include: {
        property: { include: { location: true } },
        tenant: true,
      },
    });

    res.status(201).json(application);
  } catch (error: any) {
    res.status(500).json({
      message: `Error creating application: ${error.message}`,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /applications/:id/status
// Update status; if Approved, create a Lease automatically
// ─────────────────────────────────────────────────────────────────────────────
export const updateApplicationStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (isNaN(id)) {
      res.status(400).json({ message: "Application ID must be a number" });
      return;
    }

    if (!["Pending", "Approved", "Denied"].includes(status)) {
      res.status(400).json({ message: "Invalid status value" });
      return;
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: { property: true, lease: true },
    });

    if (!application) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    // If being approved and no lease exists yet, auto-create one
    let leaseId = application.leaseId;
    if (status === "Approved" && !application.lease) {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1); // default 1-year lease

      const lease = await prisma.lease.create({
        data: {
          startDate,
          endDate,
          rent: application.property.pricePerMonth,
          deposit: application.property.securityDeposit,
          propertyId: application.propertyId,
          tenantCognitoId: application.tenantCognitoId,
        },
      });

      leaseId = lease.id;

      // Link tenant to property
      await prisma.tenant.update({
        where: { cognitoId: application.tenantCognitoId },
        data: {
          properties: { connect: { id: application.propertyId } },
        },
      });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status,
        ...(leaseId && { leaseId }),
      },
      include: {
        property: { include: { location: true } },
        tenant: true,
        lease: true,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({
      message: `Error updating application status: ${error.message}`,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /applications/:id
// ─────────────────────────────────────────────────────────────────────────────
export const deleteApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ message: "Application ID must be a number" });
      return;
    }

    await prisma.application.delete({ where: { id } });

    res.json({ message: "Application deleted successfully" });
  } catch (error: any) {
    if (error?.code === "P2025") {
      res.status(404).json({ message: "Application not found" });
      return;
    }
    res.status(500).json({
      message: `Error deleting application: ${error.message}`,
    });
  }
};
