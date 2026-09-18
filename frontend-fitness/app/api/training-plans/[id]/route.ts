import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/mongodb";
import type { UserTrainingPlan } from "@/lib/types";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const db = await getDb();
  const plan = await db.collection<UserTrainingPlan>("trainingPlans").findOne({
    id,
    userId: session.user.id,
  });
  if (!plan) return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });
  return NextResponse.json(plan);
}
