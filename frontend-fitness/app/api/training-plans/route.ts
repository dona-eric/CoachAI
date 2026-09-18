import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/mongodb";
import { getWgerExercises } from "@/lib/wger";
import { generateTrainingPlan } from "@/lib/training-plans";
import type { UserProfile, UserTrainingPlan } from "@/lib/types";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const db = await getDb();
  const plans = await db.collection<UserTrainingPlan>("trainingPlans")
    .find({ userId: session.user.id, status: "active" })
    .sort({ updatedAt: -1 })
    .toArray();
  return NextResponse.json(plans);
}

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const db = await getDb();
  const profileDocument = await db.collection<UserProfile>("userProfiles").findOne({ userId: session.user.id });
  if (!profileDocument?.onboardingDone) {
    return NextResponse.json({ error: "Complétez votre profil avant de générer un plan." }, { status: 400 });
  }

  const cached = await db.collection("wgerExercises").find({}).toArray();
  const exercises = cached.length > 0 ? cached as unknown as Awaited<ReturnType<typeof getWgerExercises>> : await getWgerExercises();
  const plan = generateTrainingPlan(session.user.id, profileDocument, exercises);

  await db.collection("trainingPlans").updateMany(
    { userId: session.user.id, status: "active" },
    { $set: { status: "archived", updatedAt: new Date() } },
  );
  await db.collection<UserTrainingPlan>("trainingPlans").insertOne(plan);
  await db.collection("userProfiles").updateOne(
    { userId: session.user.id },
    { $set: { activePlanId: plan.id, updatedAt: new Date() } },
  );

  return NextResponse.json(plan, { status: 201 });
}
