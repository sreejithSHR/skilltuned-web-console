import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

// Rename an institution — Super Admin only
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireRole(req, ["superadmin"]);
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const org = await prisma.org.update({ where: { id }, data: { name: name.trim() } });
  return NextResponse.json(org);
}

// Delete an institution (cascades to its users, scenes, headsets, sessions) — Super Admin only
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireRole(req, ["superadmin"]);
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (id === auth.orgId) {
    return NextResponse.json({ error: "You can't delete your own institution" }, { status: 400 });
  }

  await prisma.org.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
