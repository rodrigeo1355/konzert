import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      ;(session.user as { role?: string }).role = token.role as string
      return session
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl
      const publicPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/map", "/unsubscribed"]
      if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + "?"))) return true
      return !!auth?.user
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
} satisfies NextAuthConfig
