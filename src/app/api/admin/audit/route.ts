import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

// Cross-institution recent activity — Super Admin only
export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["superadmin"]);
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { org: { select: { name: true } } },
  });

  return NextResponse.json(
    logs.map((l) => ({
      id: l.id,
      type: l.type,
      message: l.message,
      actor: l.actor,
      createdAt: l.createdAt,
      orgName: l.org.name,
    }))
  );
}
