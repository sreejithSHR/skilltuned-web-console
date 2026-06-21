import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

// List institutions with monitoring stats — Super Admin only
export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["superadmin"]);
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const orgs = await prisma.org.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { users: true, vrUsers: true, scenes: true, headsets: true } },
    },
  });

  // Live session counts come from the in-memory registry shared by server.js
  const live = (global as { _activeVRUsers?: Map<string, Map<string, unknown>> })._activeVRUsers;

  const result = orgs.map((o) => ({
    id: o.id,
    name: o.name,
    createdAt: o.createdAt,
    liveCount: live?.get(o.id)?.size ?? 0,
    counts: {
      users: o._count.users,
      vrUsers: o._count.vrUsers,
      scenes: o._count.scenes,
      headsets: o._count.headsets,
    },
  }));

  return NextResponse.json(result);
}

// Create an institution + its institution-admin login — Super Admin only
export async function POST(req: NextRequest) {
  const auth = requireRole(req, ["superadmin"]);
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, adminEmail, adminPassword } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Institution name is required" }, { status: 400 });
  }

  const org = await prisma.org.create({ data: { name: name.trim() } });

  if (adminEmail?.trim() && adminPassword?.trim()) {
    const existing = await prisma.user.findUnique({ where: { email: adminEmail.trim() } });
    if (existing) {
      return NextResponse.json(
        { error: "Institution created, but that admin email is already in use" },
        { status: 409 }
      );
    }
    await prisma.user.create({
      data: {
        orgId: org.id,
        email: adminEmail.trim(),
        passwordHash: await bcrypt.hash(adminPassword, 12),
        role: "admin",
      },
    });
  }

  return NextResponse.json(org, { status: 201 });
}
