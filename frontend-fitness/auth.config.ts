import type { NextAuthConfig } from 'next-auth';

// Configuration Edge-compatible pour le Middleware
export const authConfig = {
  providers: [],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublic = ['/', '/auth/login', '/auth/register', '/auth/error'].some(
        r => nextUrl.pathname === r || nextUrl.pathname.startsWith(r + '/')
      );
      const isAuthRoute = ['/auth/login', '/auth/register'].some(
        r => nextUrl.pathname.startsWith(r)
      );

      // Redirige les utilisateurs connectés hors des pages d'auth
      if (isLoggedIn && isAuthRoute) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      // Bloque l'accès aux pages privées si non connecté
      if (!isLoggedIn && !isPublic) {
        return false; // Redirige automatiquement vers signIn
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
