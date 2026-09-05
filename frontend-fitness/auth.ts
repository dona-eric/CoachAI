import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import clientPromise, { getDb } from "@/lib/mongodb";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      name: "Identifiants",
      credentials: {
        email:    { label: "Email",        type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const db   = await getDb();
        const user = await db.collection("users").findOne({
          email: (credentials.email as string).toLowerCase().trim(),
        });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash as string
        );
        if (!valid) return null;

        return {
          id:    user._id.toString(),
          name:  user.name  as string,
          email: user.email as string,
          image: (user.image as string) ?? null,
        };
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
});