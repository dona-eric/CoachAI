import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/mongodb";
import { MealEntry } from "@/lib/types";

// GET — repas du jour ou d'une date
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  const db = await getDb();
  const meals = await db
    .collection("mealEntries")
    .find({ userId, date })
    .sort({ createdAt: 1 })
    .toArray();

  // Eau du jour
  const waterLog = await db.collection("waterLogs").findOne({ userId, date });

  return NextResponse.json({ meals, water: waterLog?.amount ?? 0 });
}

// POST — ajouter un repas
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const userId = session.user.id;
  const body: Omit<MealEntry, "userId" | "createdAt"> = await req.json();

  if (!body.foodName || !body.meal || !Number.isFinite(body.quantity) || body.quantity <= 0
    || !Number.isFinite(body.calories) || body.calories < 0
    || !Number.isFinite(body.protein) || body.protein < 0
    || !Number.isFinite(body.carbs) || body.carbs < 0
    || !Number.isFinite(body.fat) || body.fat < 0) {
    return NextResponse.json({ error: "Données repas incomplètes." }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.collection("mealEntries").insertOne({
    userId,
    date:      body.date ?? new Date().toISOString().split("T")[0],
    meal:      body.meal,
    ingredientId: body.ingredientId ?? null,
    ingredientUuid: body.ingredientUuid ?? null,
    sourceName: body.sourceName ?? "Wger",
    brand: body.brand ?? null,
    weightUnit: body.weightUnit ?? null,
    foodName:  body.foodName,
    emoji:     body.emoji ?? "🍽️",
    quantity:  body.quantity ?? 100,
    calories:  body.calories,
    protein:   body.protein ?? 0,
    carbs:     body.carbs ?? 0,
    fat:       body.fat ?? 0,
    createdAt: new Date(),
  });

  return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
}

// DELETE — supprimer un repas
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

  const { ObjectId } = await import("mongodb");
  const db = await getDb();
  await db.collection("mealEntries").deleteOne({ _id: new ObjectId(id), userId });

  return NextResponse.json({ message: "Supprimé." });
}
