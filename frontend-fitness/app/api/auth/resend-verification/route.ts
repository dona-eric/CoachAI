import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "@/lib/mongodb";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : "";
  const response = { message: "Si ce compte existe et n'est pas vérifié, un nouvel email a été envoyé." };
  if (!normalizedEmail) return NextResponse.json(response);

  const db = await getDb();
  const user = await db.collection("users").findOne({ email: normalizedEmail });
  if (!user || user.emailVerified) return NextResponse.json(response);

  const token = crypto.randomBytes(32).toString("hex");
  await db.collection("verificationTokens").deleteMany({ identifier: normalizedEmail });
  await db.collection("verificationTokens").insertOne({
    identifier: normalizedEmail,
    token,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  await sendVerificationEmail(normalizedEmail, token);
  return NextResponse.json(response);
}
