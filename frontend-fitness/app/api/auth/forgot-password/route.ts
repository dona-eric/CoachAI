import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "@/lib/mongodb";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : "";
  const response = { message: "Si ce compte existe, un lien de réinitialisation a été envoyé." };
  if (!normalizedEmail) return NextResponse.json(response);

  const db = await getDb();
  const user = await db.collection("users").findOne({ email: normalizedEmail });
  if (!user) return NextResponse.json(response);

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  await db.collection("passwordResetTokens").deleteMany({ userId: user._id.toString() });
  await db.collection("passwordResetTokens").insertOne({
    userId: user._id.toString(),
    tokenHash,
    expires: new Date(Date.now() + 60 * 60 * 1000),
    createdAt: new Date(),
  });
  await sendPasswordResetEmail(normalizedEmail, token);
  return NextResponse.json(response);
}
