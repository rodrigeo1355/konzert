import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@konzert/database"
import { verifyPassword, hashPassword, validatePasswordStrength } from "@/lib/password"
import { checkRateLimit } from "@/lib/rate-limit"

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const ip = req.headers.get("x-forwarded-for") ?? "unknown"
  const { allowed } = checkRateLimit(`change-password:${session.user.id}:${ip}`, 5, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: "Demasiados intentos. Intenta en un minuto." }, { status: 429 })
  }

  const body = (await req.json().catch(() => ({}))) as {
    currentPassword?: string
    newPassword?: string
  }
  const { currentPassword, newPassword } = body

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Faltan campos requeridos." }, { status: 400 })
  }

  const strength = validatePasswordStrength(newPassword)
  if (!strength.isValid) {
    return NextResponse.json({ error: "La nueva contraseña no cumple los requisitos." }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  })
  if (!user) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 })

  const valid = await verifyPassword(currentPassword, user.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: "La contraseña actual es incorrecta." }, { status: 400 })
  }

  const newHash = await hashPassword(newPassword)
  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newHash },
    }),
    prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "PASSWORD_CHANGED",
        targetType: "User",
        targetId: session.user.id,
      },
    }),
  ])

  return NextResponse.json({ ok: true })
}
