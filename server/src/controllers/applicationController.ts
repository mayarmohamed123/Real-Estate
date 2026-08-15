import type { Request, Response } from "express";
import prisma from "../prisma.js";
import { z } from "zod";

// ── Shared Error Handler ──────────────────────────────────────────────────────
function serverError(res: Response, error: unknown, context: string): void {
  console.error(`[${context}]`, error);
  res.status(500).json({ message: "An unexpected error occurred. Please try again." });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function calculateNextPaymentDate(
  lease: { startDate: Date; endDate: Date },
  lastPaymentDate: Date | null
): Date | null {
  const now = new Date();
  if (now > lease.endDate) return null;

  const base = lastPaymentDate ?? lease.startDate;
  const next = new Date(base);
  next.setMonth(next.getMonth() + 1);

  return next > lease.endDate ? null : next;
}

// ── Validation schemas ────────────────────────────────────────────────────────
const createApplicationSchema = z.object({
  propertyId: z.coerce.number().int().positive("Property ID must be a positive integer"),
  tenantCognitoId: z.string().min(1, "Tenant ID is required"),
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required").max(50),
  message: z.string().max(2000).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["Pending", "Approved", "Denied"]),
});

// ── GET /applications ─────────────────────────────────────────────────────────
export const listApplications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, userType } = req.query;

    if (!userId || !userType) {
      res.status(400).json({ message: "userId and userType are required" });
      return;
    }

    const whereClause =
      userType === "tenant"
        ? { tenantCognitoId: String(userId) }
        : { property: { managerCognitoId: String(userId) } };

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        property: { include: { location: true } },
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
      return { ...app, nextPaymentDate };
    });

    res.json(enriched);
  } catch (error) {
    serverError(res, error, "listApplications");
  }
};

// ── GET /applications/:id ─────────────────────────────────────────────────────
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
  } catch (error) {
    serverError(res, error, "getApplication");
  }
};

// ── POST /applications ────────────────────────────────────────────────────────
export const createApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parsed = createApplicationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation error",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { propertyId, tenantCognitoId, name, email, phoneNumber, message } =
      parsed.data;

    const application = await prisma.application.create({
      data: {
        applicationDate: new Date(),
        status: "Pending",
        propertyId,
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
  } catch (error) {
    serverError(res, error, "createApplication");
  }
};

// ── PUT /applications/:id/status ──────────────────────────────────────────────
// Only the manager who owns the property may approve/deny an application.
export const updateApplicationStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: "Application ID must be a number" });
      return;
    }

    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation error",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { status } = parsed.data;

    const application = await prisma.application.findUnique({
      where: { id },
      include: { property: true, lease: true },
    });

    if (!application) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    // Authorization — only the manager who owns the property can update status
    if (application.property.managerCognitoId !== req.user?.id) {
      res.status(403).json({ message: "Forbidden: you do not manage this property" });
      return;
    }

    // If being approved and no lease exists yet, auto-create one (1-year default)
    let leaseId = application.leaseId;
    if (status === "Approved" && !application.lease) {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);

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
        data: { properties: { connect: { id: application.propertyId } } },
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
  } catch (error) {
    serverError(res, error, "updateApplicationStatus");
  }
};

// ── DELETE /applications/:id ──────────────────────────────────────────────────
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
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.code === "P2025") {
      res.status(404).json({ message: "Application not found" });
      return;
    }
    serverError(res, error, "deleteApplication");
  }
};
