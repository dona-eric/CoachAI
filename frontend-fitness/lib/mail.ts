import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io";
const smtpPort = parseInt(process.env.SMTP_PORT || "2525", 10);
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASSWORD || "";
const smtpFrom = process.env.SMTP_FROM || "KINETIC <noreply@kinetic-fitness.com>";

export const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  ...(smtpUser && smtpPass ? {
    auth: {
      user: smtpUser,
      pass: smtpPass,
    }
  } : {}),
});

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #10b981; margin: 0;">KINETIC</h1>
      </div>
      <div style="background-color: #f9f9f9; padding: 30px; border-radius: 8px;">
        <h2 style="margin-top: 0; color: #111;">Confirmez votre adresse email</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">
          Bienvenue sur KINETIC ! Avant de pouvoir commencer votre entraînement et accéder à votre tableau de bord, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
            Vérifier mon compte
          </a>
        </div>
        <p style="font-size: 14px; color: #888; margin-bottom: 0;">
          Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur : <br/>
          <a href="${verifyUrl}" style="color: #10b981;">${verifyUrl}</a>
        </p>
      </div>
      <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
        <p>Ce lien expirera dans 24 heures.</p>
        <p>&copy; ${new Date().getFullYear()} KINETIC Fitness. Tous droits réservés.</p>
      </div>
    </div>
  `;

  if (!smtpUser || !smtpPass) {
    console.warn("⚠️ SMTP_USER ou SMTP_PASSWORD manquant dans .env.local.");
    console.warn("L'email n'a pas été envoyé. Voici le lien de vérification pour tester localement :");
    console.info("➡️  " + verifyUrl);
    return;
  }

  try {
    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject: "Action requise : Vérifiez votre compte KINETIC",
      html: htmlContent,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de vérification :", error);
    // On ne lève pas l'erreur pour ne pas bloquer l'API, mais en production il faudrait la gérer
  }
}
