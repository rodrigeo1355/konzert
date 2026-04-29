import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@konzert/database"
import { verifyPassword } from "@/lib/password"

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as { password?: string }
  if (!body.password) {
    return NextResponse.json({ error: "Se requiere la contraseña para confirmar." }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  })
  if (!user) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 })

  const valid = await verifyPassword(body.password, user.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 400 })
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { deletedAt: new Date(), status: "BLOCKED" },
    }),
    prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "ACCOUNT_DELETED",
        targetType: "User",
        targetId: session.user.id,
      },
    }),
  ])

  return NextResponse.json({ ok: true })
}
