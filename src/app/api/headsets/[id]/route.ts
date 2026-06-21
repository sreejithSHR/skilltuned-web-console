import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { label } = await req.json();

  const existing = await prisma.headset.findFirst({
    where: { id, orgId: auth.orgId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const headset = await prisma.headset.update({
    where: { id },
    data: { label: label?.trim() },
  });

  return NextResponse.json(headset);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const existing = await prisma.headset.findFirst({
    where: { id, orgId: auth.orgId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.headset.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
