import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  const checkedAt = new Date().toISOString();

  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return NextResponse.json({
      status: "ok",
      services: { database: "ok" },
      checkedAt,
    });
  } catch (error) {
    console.error("[HEALTH] Database check failed:", error);
    return NextResponse.json(
      {
        status: "degraded",
        services: { database: "unavailable" },
        checkedAt,
      },
      { status: 503 },
    );
  }
}
