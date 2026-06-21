import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, deviceId } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { org: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // If a headset deviceId is provided (VR login), register/update the headset
    if (deviceId) {
      await prisma.headset.upsert({
        where: { deviceId_orgId: { deviceId, orgId: user.orgId } },
        create: {
          orgId: user.orgId,
          deviceId,
          deviceToken: crypto.randomUUID(),
          label: `Headset ${deviceId.slice(0, 8)}`,
          status: "online",
          lastSeen: new Date(),
        },
        update: {
          lastSeen: new Date(),
          status: "online",
        },
      });
    }

    const token = signToken({ userId: user.id, orgId: user.orgId, role: user.role });

    return NextResponse.json({
      token,
      user: { id: user.id, orgId: user.orgId, email: user.email, role: user.role },
      org: { id: user.org.id, name: user.org.name },
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
