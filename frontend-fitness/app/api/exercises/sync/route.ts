import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { syncWgerCatalog } from "@/lib/wger-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST() {
  try {
    const summary = await syncWgerCatalog(await getDb());
    return NextResponse.json({ source: "wger", syncedAt: new Date().toISOString(), summary });
  } catch (error) {
    console.error("[WGER_SYNC] Catalog synchronization failed:", error);
    return NextResponse.json(
      { error: "La synchronisation complète Wger a échoué." },
      { status: 503 },
    );
  }
}
