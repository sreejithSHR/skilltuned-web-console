import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";

export async function POST(req: NextRequest) {
  try {
    const { username, orgId } = await req.json();

    if (!username?.trim() || !orgId) {
      return NextResponse.json({ error: "Username and orgId are required" }, { status: 400 });
    }

    const vrUser = await prisma.vRUser.findFirst({
      where: { username: username.trim(), orgId },
      include: { org: { select: { name: true } } },
    });

    if (!vrUser) {
      return NextResponse.json({ error: "User not found. Ask your admin to add you." }, { status: 404 });
    }

    const token = jwt.sign(
      { vrUserId: vrUser.id, orgId: vrUser.orgId, username: vrUser.username, clientType: "vr_user" },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    return NextResponse.json({
      token,
      vrUser: { id: vrUser.id, username: vrUser.username, orgId: vrUser.orgId },
      org: { id: vrUser.orgId, name: vrUser.org.name },
    });
  } catch (err) {
    console.error("VR login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
