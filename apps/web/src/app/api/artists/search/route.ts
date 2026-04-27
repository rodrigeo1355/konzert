import { NextResponse } from "next/server"
import { prisma } from "@konzert/database"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json([])
  }

  const normalized = q
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()

  const artists = await prisma.artist.findMany({
    where: { nameNormalized: { contains: normalized } },
    select: { id: true, name: true, imageUrl: true },
    orderBy: { name: "asc" },
    take: 20,
  })

  return NextResponse.json(artists)
}
