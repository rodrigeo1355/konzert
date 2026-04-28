import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@konzert/database"

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const notification = await prisma.notification.findUnique({
    where: { id: id },
    select: { userId: true },
  })

  if (!notification || notification.userId !== session.user.id) {
    return NextResponse.json({ error: "No encontrado." }, { status: 404 })
  }

  await prisma.notification.update({
    where: { id: id },
    data: { readAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}
