import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/mongodb";
import { UserProfile } from "@/lib/types";
import { ObjectId } from "mongodb";

// GET — récupérer le profil de l'utilisateur connecté
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const userId = session.user.id;
  const db = await getDb();

  const profile = await db.collection("userProfiles").findOne({ userId });
  if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  return NextResponse.json({
    ...profile,
    name:  session.user.name,
    email: session.user.email,
  });
}

// PATCH — mettre à jour le profil (onboarding + modifications)
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const userId = session.user.id;
  const body: Partial<UserProfile> & { name?: string } = await req.json();
  if (body.name !== undefined && (typeof body.name !== "string" || body.name.trim().length < 2 || body.name.trim().length > 80)) {
    return NextResponse.json({ error: "Nom invalide." }, { status: 400 });
  }

  if (body.age !== undefined && (!Number.isInteger(body.age) || body.age < 13 || body.age > 100)) {
    return NextResponse.json({ error: "Âge invalide." }, { status: 400 });
  }
  if (body.height !== undefined && (!Number.isFinite(body.height) || body.height < 100 || body.height > 250)) {
    return NextResponse.json({ error: "Taille invalide." }, { status: 400 });
  }
  if (body.weight !== undefined && (!Number.isFinite(body.weight) || body.weight < 25 || body.weight > 400)) {
    return NextResponse.json({ error: "Poids invalide." }, { status: 400 });
  }

  // Champs autorisés à mettre à jour
  const allowed: (keyof UserProfile)[] = [
    "age", "height", "weight", "level", "goal",
    "equipment", "activePlanId", "onboardingDone",
  ];
  const update = Object.fromEntries(
    allowed
      .filter(key => body[key] !== undefined)
      .map(key => [key, body[key]]),
  ) as Partial<UserProfile>;
  update.updatedAt = new Date();

  const db = await getDb();
  if (body.name !== undefined) {
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { name: body.name.trim() } },
    );
  }
  await db.collection("userProfiles").updateOne(
    { userId },
    { $set: update },
    { upsert: true }
  );

  return NextResponse.json({ message: "Profil mis à jour." });
}
