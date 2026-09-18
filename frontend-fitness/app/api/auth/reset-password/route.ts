import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const { token, email, password } = await req.json();
  const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : "";
  if (typeof token !== "string" || !normalizedEmail || typeof password !== "string") {
    return NextResponse.json({ error: "Lien ou données invalides." }, { status: 400 });
  }
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre." }, { status: 400 });
  }

  const db = await getDb();
  const user = await db.collection("users").findOne({ email: normalizedEmail });
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const reset = user && await db.collection("passwordResetTokens").findOne({
    userId: user._id.toString(),
    tokenHash,
    expires: { $gt: new Date() },
  });
  if (!reset) return NextResponse.json({ error: "Lien invalide ou expiré." }, { status: 400 });

  await db.collection("users").updateOne(
    { _id: user._id },
    { $set: { passwordHash: await bcrypt.hash(password, 12) } },
  );
  await db.collection("passwordResetTokens").deleteOne({ _id: reset._id });
  return NextResponse.json({ message: "Mot de passe réinitialisé." });
}
