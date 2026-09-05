import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/mongodb";
import { UserProfile } from "@/lib/types";

// GET — récupérer le profil de l'utilisateur connecté
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const userId = (session.user as any).id as string;
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

  const userId = (session.user as any).id as string;
  const body: Partial<UserProfile> = await req.json();

  // Champs autorisés à mettre à jour
  const allowed: (keyof UserProfile)[] = [
    "age", "height", "weight", "level", "goal",
    "equipment", "activePlanId", "onboardingDone",
  ];
  const update: Partial<UserProfile> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) (update as any)[key] = body[key];
  }
  update.updatedAt = new Date();

  const db = await getDb();
  await db.collection("userProfiles").updateOne(
    { userId },
    { $set: update },
    { upsert: true }
  );

  return NextResponse.json({ message: "Profil mis à jour." });
}
