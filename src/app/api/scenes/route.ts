import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const scenes = await prisma.scene.findMany({
    where: { orgId: auth.orgId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(scenes);
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, sceneKey, description, tags, thumbnailUrl } = await req.json();
  if (!name?.trim() || !sceneKey?.trim()) {
    return NextResponse.json({ error: "Name and sceneKey are required" }, { status: 400 });
  }

  const normalizedTags = Array.isArray(tags)
    ? tags.map((t: string) => t.trim().toLowerCase()).filter(Boolean)
    : [];

  const scene = await prisma.scene.create({
    data: {
      orgId: auth.orgId,
      name: name.trim(),
      sceneKey: sceneKey.trim(),
      description: description?.trim() || null,
      tags: normalizedTags,
      thumbnailUrl: thumbnailUrl?.trim() || null,
    },
  });

  return NextResponse.json(scene, { status: 201 });
}
