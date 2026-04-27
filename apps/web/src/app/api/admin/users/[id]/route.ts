import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@konzert/database"
import { sendEmail, AccountSuspendedEmail, PasswordResetEmail } from "@konzert/emails"
import { randomBytes } from "node:crypto"
import * as React from "react"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return null
  if ((session.user as { role?: string }).role !== "ADMIN") return null
  return session.user as { id: string }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = (await req.json()) as { action: "block" | "unblock" | "force-reset" }

  const user = await prisma.user.findUnique({
    where: { id: params.id, deletedAt: null },
    select: { id: true, email: true, status: true },
  })
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://konzert.cl"

  if (body.action === "block") {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { status: "BLOCKED" },
      }),
      prisma.session.deleteMany({ where: { userId: user.id } }),
    ])

    await sendEmail({
      to: user.email,
      subject: "Tu cuenta de Konzert ha sido suspendida",
      react: React.createElement(AccountSuspendedEmail, {
        supportUrl: `${baseUrl}/contact`,
      }),
    }).catch(console.error)

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "user.block",
        targetType: "User",
        targetId: user.id,
        metadata: { email: user.email },
      },
    })
  } else if (body.action === "unblock") {
    await prisma.user.update({
      where: { id: user.id },
      data: { status: "ACTIVE", failedLoginCount: 0, lockedUntil: null },
    })

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "user.unblock",
        targetType: "User",
        targetId: user.id,
        metadata: { email: user.email },
      },
    })
  } else if (body.action === "force-reset") {
    const token = randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.$transaction([
      prisma.passwordReset.create({
        data: { userId: user.id, token, expiresAt },
      }),
      prisma.session.deleteMany({ where: { userId: user.id } }),
    ])

    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    await sendEmail({
      to: user.email,
      subject: "Debes restablecer tu contraseña de Konzert",
      react: React.createElement(PasswordResetEmail, {
        resetUrl,
        expiresInMinutes: 1440,
      }),
    }).catch(console.error)

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "user.force-reset",
        targetType: "User",
        targetId: user.id,
        metadata: { email: user.email },
      },
    })
  } else {
    return NextResponse.json({ error: "Acción inválida." }, { status: 422 })
  }

  return NextResponse.json({ ok: true })
}
