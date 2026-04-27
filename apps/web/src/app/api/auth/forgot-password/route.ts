import { NextResponse } from "next/server"
import { prisma } from "@konzert/database"
import { sendEmail, PasswordResetEmail } from "@konzert/emails"
import { checkRateLimit } from "@/lib/rate-limit"
import * as React from "react"
import crypto from "crypto"

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown"
  const { allowed } = checkRateLimit(`forgot:${ip}`, 3, 60_000)

  if (!allowed) {
    return NextResponse.json({ error: "Demasiados intentos." }, { status: 429 })
  }

  const { email } = await req.json() as { email?: string }

  // Siempre responder OK para no revelar si el email existe
  if (!email) return NextResponse.json({ ok: true })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.deletedAt) return NextResponse.json({ ok: true })

  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

  await prisma.passwordReset.create({
    data: { userId: user.id, token, expiresAt },
  })

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  const resetUrl = `${baseUrl}/reset-password?token=${token}`

  await sendEmail({
    to: email,
    subject: "Recupera tu contraseña de Konzert",
    react: React.createElement(PasswordResetEmail, { resetUrl, expiresInMinutes: 30 }),
  })

  return NextResponse.json({ ok: true })
}
