import type { NextFunction, Request, Response } from "express";
import { CognitoJwtVerifier } from "aws-jwt-verify";

// ── Types ────────────────────────────────────────────────────────────────────
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

// ── Cognito JWT Verifier (cached, lazy) ──────────────────────────────────────
// Uses AWS's official aws-jwt-verify library.
// - Fetches and caches the Cognito JWKS automatically.
// - Verifies the idToken (contains custom:role, email, sub).
// - Handles clock skew via graceSeconds.
const userPoolId = process.env.COGNITO_USER_POOL_ID || "eu-north-1_0QHrUBYgf";
const clientId =
  process.env.COGNITO_CLIENT_ID ||
  process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID ||
  "24md6jbutq3khkm42smd8tlpfo";

const verifier = CognitoJwtVerifier.create({
  userPoolId,
  clientId,
  tokenUse: "id",   // We send the idToken which carries custom:role
});

// ── Middleware Factory ────────────────────────────────────────────────────────
export const authMiddleware = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      res.status(401).json({ message: "Unauthorized — no token provided" });
      return;
    }

    try {
      const payload = await verifier.verify(token);

      const userRole = (payload["custom:role"] as string | undefined) ?? "";

      req.user = {
        id: payload.sub,
        role: userRole,
      };

      const hasAccess = allowedRoles.includes(userRole.toLowerCase());
      if (!hasAccess) {
        res.status(403).json({ message: "Access Denied" });
        return;
      }

      next();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn("[authMiddleware] Token verification failed:", message);
      res.status(401).json({ message: "Invalid or expired token", error: message });
    }
  };
};
