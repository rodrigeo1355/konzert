import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@konzert/database"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return null
  if ((session.user as { role?: string }).role !== "ADMIN") return null
  return session.user as { id: string }
}

const CONFIDENCE_THRESHOLD = 0.9

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const pending = await prisma.eventArtist.findMany({
    where: { matchScore: { lt: CONFIDENCE_THRESHOLD } },
    include: {
      event: { select: { id: true, title: true, dateStart: true } },
      artist: { select: { id: true, name: true, imageUrl: true } },
    },
    orderBy: { matchScore: "desc" },
    take: 100,
  })

  return NextResponse.json(pending)
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = (await req.json()) as {
    eventId: string
    artistId: string
    action: "approve" | "reject"
  }

  if (!body.eventId || !body.artistId || !body.action) {
    return NextResponse.json({ error: "Faltan campos." }, { status: 422 })
  }

  if (body.action === "approve") {
    await prisma.eventArtist.update({
      where: { eventId_artistId: { eventId: body.eventId, artistId: body.artistId } },
      data: { matchScore: 1.0 },
    })
  } else {
    await prisma.eventArtist.delete({
      where: { eventId_artistId: { eventId: body.eventId, artistId: body.artistId } },
    })
  }

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: `artist.match.${body.action}`,
      targetType: "EventArtist",
      targetId: `${body.eventId}:${body.artistId}`,
      metadata: { eventId: body.eventId, artistId: body.artistId },
    },
  })

  return NextResponse.json({ ok: true })
}
