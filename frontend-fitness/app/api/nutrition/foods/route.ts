import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { searchWgerFoods } from "@/lib/wger";

export async function GET(req: NextRequest) {
  const search = new URL(req.url).searchParams.get("search")?.trim() ?? "";
  if (search.length < 2) {
    return NextResponse.json({ source: "wger", foods: [] });
  }

  const db = await getDb();
  await db.collection("wgerFoods").createIndex({ id: 1 }, { unique: true });
  try {
    const foods = await searchWgerFoods(search);
    if (foods.length > 0) {
      await db.collection("wgerFoods").bulkWrite(
        foods.map(food => ({
          replaceOne: {
            filter: { id: food.id },
            replacement: food,
            upsert: true,
          },
        })),
      );
    }
    return NextResponse.json({ source: "wger", foods });
  } catch (error) {
    console.error("[NUTRITION] Wger food search failed:", error);
    const foods = await db.collection("wgerFoods")
      .find({ name: { $regex: search, $options: "i" } })
      .limit(20)
      .toArray();
    return NextResponse.json({ source: "wger-cache", foods }, { status: foods.length > 0 ? 200 : 503 });
  }
}
