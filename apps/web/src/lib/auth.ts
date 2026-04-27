import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@konzert/database"
import { verifyPassword } from "./password"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || user.deletedAt) return null

        if (user.status === "BLOCKED") {
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new Error("ACCOUNT_LOCKED")
          }
          await prisma.user.update({
            where: { id: user.id },
            data: { status: "ACTIVE", failedLoginCount: 0, lockedUntil: null },
          })
        }

        const valid = await verifyPassword(credentials.password as string, user.passwordHash)

        if (!valid) {
          const newCount = user.failedLoginCount + 1
          if (newCount >= 5) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginCount: newCount,
                status: "BLOCKED",
                lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
              },
            })
            throw new Error("ACCOUNT_LOCKED")
          }
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginCount: newCount },
          })
          return null
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginCount: 0 },
        })

        return { id: user.id, email: user.email, role: user.role }
      },
    }),
  ],
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
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
})
