import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // Validation
    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit faire au moins 6 caractères." }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email invalide." }, { status: 400 });
    }

    const db = await getDb();

    // Vérifier si email déjà utilisé
    const existing = await db.collection("users").findOne({
      email: email.toLowerCase().trim(),
    });
    if (existing) {
      return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 });
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const now = new Date();
    const userResult = await db.collection("users").insertOne({
      name:          name.trim(),
      email:         email.toLowerCase().trim(),
      passwordHash,
      emailVerified: null,
      image:         null,
      createdAt:     now,
    });

    // Créer le profil vide (onboarding requis)
    await db.collection("userProfiles").insertOne({
      userId:          userResult.insertedId.toString(),
      level:           "debutant",
      goal:            "sante",
      equipment:       ["bodyweight"],
      streak:          0,
      onboardingDone:  false,
      updatedAt:       now,
    });

    return NextResponse.json(
      { message: "Compte créé avec succès.", userId: userResult.insertedId.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER] Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur. Réessayez." }, { status: 500 });
  }
}
