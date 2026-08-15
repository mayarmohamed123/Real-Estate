import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtHeader, type JwtPayload, type SigningKeyCallback } from "jsonwebtoken";
import jwksRsa from "jwks-rsa";

// ── Types ────────────────────────────────────────────────────────────────────
interface DecodedToken extends JwtPayload {
  sub: string;
  "custom:role"?: string;
}

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

// ── JWKS Client (cached, rate-limited) ───────────────────────────────────────
// Verifies JWTs against the Cognito public key — prevents forged tokens.
const jwksClient = jwksRsa({
  jwksUri: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600_000, // 10 minutes
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

function getSigningKey(header: JwtHeader, callback: SigningKeyCallback): void {
  if (!header.kid) {
    callback(new Error("JWT has no kid header"));
    return;
  }
  jwksClient.getSigningKey(header.kid, (err, key) => {
    if (err || !key) {
      callback(err ?? new Error("Signing key not found"));
      return;
    }
    callback(null, key.getPublicKey());
  });
}

// ── Middleware Factory ────────────────────────────────────────────────────────
export const authMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    jwt.verify(token, getSigningKey, { algorithms: ["RS256"] }, (err, decoded) => {
      if (err || !decoded) {
        console.warn("[authMiddleware] Token verification failed:", err?.message);
        res.status(401).json({ message: "Invalid or expired token" });
        return;
      }

      const payload = decoded as DecodedToken;
      const userRole = payload["custom:role"] ?? "";

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
    });
  };
};
