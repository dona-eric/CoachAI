import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const { amount }: { amount: number } = await req.json();

  if (typeof amount !== "number" || amount < 0) {
    return NextResponse.json({ error: "Montant invalide." }, { status: 400 });
  }

  const date = new Date().toISOString().split("T")[0];
  const db = await getDb();

  await db.collection("waterLogs").updateOne(
    { userId, date },
    { $set: { amount, updatedAt: new Date() } },
    { upsert: true }
  );

  return NextResponse.json({ amount });
}
