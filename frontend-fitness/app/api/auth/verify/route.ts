import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { token, email } = await req.json();

    if (!token || !email) {
      return NextResponse.json({ error: "Token ou email manquant." }, { status: 400 });
    }

    const db = await getDb();

    // Chercher le token dans la base
    const verification = await db.collection("verificationTokens").findOne({
      identifier: email.toLowerCase().trim(),
      token: token,
    });

    if (!verification) {
      return NextResponse.json({ error: "Lien de vérification invalide ou introuvable." }, { status: 400 });
    }

    // Vérifier l'expiration
    if (new Date(verification.expires) < new Date()) {
      return NextResponse.json({ error: "Ce lien de vérification a expiré." }, { status: 400 });
    }

    // Mettre à jour l'utilisateur
    const updateResult = await db.collection("users").updateOne(
      { email: email.toLowerCase().trim() },
      { $set: { emailVerified: new Date() } }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    // Supprimer le token utilisé
    await db.collection("verificationTokens").deleteOne({ _id: verification._id });

    return NextResponse.json({ message: "Email vérifié avec succès." }, { status: 200 });
  } catch (error) {
    console.error("[VERIFY_EMAIL] Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
