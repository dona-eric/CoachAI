import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getWgerCatalogMetadata, type WgerCatalogMetadata } from "@/lib/wger";

export async function GET() {
  const db = await getDb();
  const cached = await db.collection<WgerCatalogMetadata>("wgerCatalogMetadata").findOne({ key: "catalog" });
  if (cached) {
    return NextResponse.json({ source: "wger-cache", ...cached });
  }

  try {
    const metadata = await getWgerCatalogMetadata();
    await db.collection("wgerCatalogMetadata").replaceOne(
      { key: "catalog" },
      { key: "catalog", ...metadata, updatedAt: new Date() },
      { upsert: true },
    );
    return NextResponse.json({ source: "wger", ...metadata });
  } catch (error) {
    console.error("[EXERCISES] Wger metadata request failed:", error);
    return NextResponse.json(
      { error: "Les métadonnées Wger sont temporairement indisponibles." },
      { status: 503 },
    );
  }
}
