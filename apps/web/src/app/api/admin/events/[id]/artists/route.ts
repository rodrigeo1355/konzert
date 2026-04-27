import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@konzert/database"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return null
  if ((session.user as { role?: string }).role !== "ADMIN") return null
  return session.user as { id: string }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = (await req.json()) as { artistId: string }
  if (!body.artistId) return NextResponse.json({ error: "artistId requerido." }, { status: 422 })

  const [event, artist] = await Promise.all([
    prisma.event.findUnique({ where: { id: params.id }, select: { id: true, title: true } }),
    prisma.artist.findUnique({ where: { id: body.artistId }, select: { id: true, name: true } }),
  ])

  if (!event || !artist) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.eventArtist.upsert({
    where: { eventId_artistId: { eventId: params.id, artistId: body.artistId } },
    update: { matchScore: 1.0 },
    create: { eventId: params.id, artistId: body.artistId, matchScore: 1.0 },
  })

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "event.artist.link",
      targetType: "EventArtist",
      targetId: `${params.id}:${body.artistId}`,
      metadata: { eventTitle: event.title, artistName: artist.name },
    },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const artistId = searchParams.get("artistId")
  if (!artistId) return NextResponse.json({ error: "artistId requerido." }, { status: 422 })

  await prisma.eventArtist.deleteMany({
    where: { eventId: params.id, artistId },
  })

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "event.artist.unlink",
      targetType: "EventArtist",
      targetId: `${params.id}:${artistId}`,
      metadata: { eventId: params.id, artistId },
    },
  })

  return NextResponse.json({ ok: true })
}
