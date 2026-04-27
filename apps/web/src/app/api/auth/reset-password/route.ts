import { NextResponse } from "next/server"
import { prisma } from "@konzert/database"
import { hashPassword, validatePasswordStrength } from "@/lib/password"

export async function POST(req: Request) {
  const { token, password } = await req.json() as { token?: string; password?: string }

  if (!token || !password) {
    return NextResponse.json({ error: "Token y contraseña son requeridos." }, { status: 400 })
  }

  const strength = validatePasswordStrength(password)
  if (!strength.isValid) {
    return NextResponse.json({ error: "La contraseña no cumple los requisitos." }, { status: 400 })
  }

  const reset = await prisma.passwordReset.findUnique({ where: { token } })

  if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
    return NextResponse.json({ error: "TOKEN_INVALID" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: reset.userId } })
  if (!user) return NextResponse.json({ error: "TOKEN_INVALID" }, { status: 400 })

  const isSamePassword = await import("@/lib/password").then((m) =>
    m.verifyPassword(password, user.passwordHash)
  )
  if (isSamePassword) {
    return NextResponse.json({ error: "No puedes reutilizar tu contraseña anterior." }, { status: 400 })
  }

  const passwordHash = await hashPassword(password)

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
    prisma.session.deleteMany({ where: { userId: user.id } }),
  ])

  return NextResponse.json({ ok: true })
}
