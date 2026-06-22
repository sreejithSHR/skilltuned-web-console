import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, signToken } from "@/lib/auth";

// Super Admin "view as": mint a token scoped to a chosen institution (acts as its admin)
export async function POST(req: NextRequest) {
  const auth = requireRole(req, ["superadmin"]);
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { orgId } = await req.json();
  if (!orgId) return NextResponse.json({ error: "orgId is required" }, { status: 400 });

  const org = await prisma.org.findUnique({ where: { id: orgId } });
  if (!org) return NextResponse.json({ error: "Institution not found" }, { status: 404 });

  // Keep the super admin's userId so audit attribution still points at them,
  // but scope the token to the target org with admin powers.
  const token = signToken({ userId: auth.userId, orgId: org.id, role: "admin" });

  return NextResponse.json({ token, org: { id: org.id, name: org.name } });
}
