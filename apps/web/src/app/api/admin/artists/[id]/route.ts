import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@konzert/database"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return null
  if ((session.user as { role?: string }).role !== "ADMIN") return null
  return session.user as { id: string }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const artist = await prisma.artist.findUnique({ where: { id: params.id } })
  if (!artist) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.artist.delete({ where: { id: params.id } })

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "artist.delete",
      targetType: "Artist",
      targetId: params.id,
      metadata: { name: artist.name },
    },
  })

  return NextResponse.json({ ok: true })
}
