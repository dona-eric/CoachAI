import { NextResponse } from "next/server";
import { getWgerFeaturedExercise } from "@/lib/wger";

export const revalidate = 3600;

export async function GET() {
  try {
    const featured = await getWgerFeaturedExercise();
    if (!featured) {
      return NextResponse.json({ error: "Aucun exercice illustré disponible." }, { status: 404 });
    }

    return NextResponse.json(
      { exercise: featured },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
    );
  } catch (error) {
    console.error("[FEATURED_EXERCISE] Wger request failed:", error);
    return NextResponse.json({ error: "Démonstration temporairement indisponible." }, { status: 503 });
  }
}
