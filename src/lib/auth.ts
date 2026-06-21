import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";

export interface JwtPayload {
  userId: string;
  orgId: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function requireAuth(req: NextRequest): JwtPayload | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return verifyToken(auth.slice(7));
}

/** Returns the payload only if the user's role is in `roles`, else null. */
export function requireRole(req: NextRequest, roles: string[]): JwtPayload | null {
  const payload = requireAuth(req);
  if (!payload || !roles.includes(payload.role)) return null;
  return payload;
}
