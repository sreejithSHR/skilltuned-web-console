import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const headsets = await prisma.headset.findMany({
    where: { orgId: auth.orgId },
    orderBy: { lastSeen: "desc" },
  });

  return NextResponse.json(headsets);
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { label } = await req.json();
  if (!label?.trim()) {
    return NextResponse.json({ error: "Label is required" }, { status: 400 });
  }

  const deviceId = crypto.randomUUID();
  const deviceToken = crypto.randomUUID();

  const headset = await prisma.headset.create({
    data: {
      orgId: auth.orgId,
      deviceId,
      deviceToken,
      label: label.trim(),
    },
  });

  return NextResponse.json(headset, { status: 201 });
}
