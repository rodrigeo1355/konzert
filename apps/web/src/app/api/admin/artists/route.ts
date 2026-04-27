import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@konzert/database"
import { normalizeArtistName } from "@/lib/spotify"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return null
  if ((session.user as { role?: string }).role !== "ADMIN") return null
  return session.user as { id: string }
}

export async function GET(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim()
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const pageSize = 30

  const where = q
    ? { nameNormalized: { contains: normalizeArtistName(q) } }
    : {}

  const [artists, total] = await Promise.all([
    prisma.artist.findMany({
      where,
      include: {
        _count: { select: { followers: true, eventArtists: true } },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.artist.count({ where }),
  ])

  return NextResponse.json({ artists, total, page, pageSize })
}

export async function POST(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = (await req.json()) as {
    spotifyId?: string
    name: string
    imageUrl?: string
  }

  if (!body.name) return NextResponse.json({ error: "Nombre requerido." }, { status: 422 })

  const nameNormalized = normalizeArtistName(body.name)

  const existing = body.spotifyId
    ? await prisma.artist.findUnique({ where: { spotifyId: body.spotifyId } })
    : await prisma.artist.findFirst({ where: { nameNormalized } })

  if (existing) {
    return NextResponse.json({ error: "El artista ya existe en el catálogo." }, { status: 409 })
  }

  const artist = await prisma.artist.create({
    data: {
      name: body.name,
      nameNormalized,
      imageUrl: body.imageUrl,
      spotifyId: body.spotifyId,
    },
  })

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "artist.import",
      targetType: "Artist",
      targetId: artist.id,
      metadata: { name: artist.name, spotifyId: artist.spotifyId },
    },
  })

  return NextResponse.json(artist, { status: 201 })
}
