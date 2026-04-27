import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@konzert/database"

const MAX_FOLLOWING = 50

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const userId = session.user.id
  const artistId = params.id

  const artist = await prisma.artist.findUnique({ where: { id: artistId }, select: { id: true } })
  if (!artist) return NextResponse.json({ error: "Artista no encontrado." }, { status: 404 })

  const count = await prisma.userArtist.count({ where: { userId } })
  if (count >= MAX_FOLLOWING) {
    return NextResponse.json(
      { error: `Límite de ${MAX_FOLLOWING} artistas alcanzado.` },
      { status: 422 }
    )
  }

  await prisma.userArtist.upsert({
    where: { userId_artistId: { userId, artistId } },
    update: {},
    create: { userId, artistId },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  await prisma.userArtist.deleteMany({
    where: { userId: session.user.id, artistId: params.id },
  })

  return NextResponse.json({ ok: true })
}
