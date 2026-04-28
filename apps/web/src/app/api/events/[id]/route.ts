import { NextResponse } from "next/server"
import { prisma } from "@konzert/database"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await prisma.event.findUnique({
    where: { id: id, status: "PUBLISHED" },
    include: {
      venue: true,
      artists: { include: { artist: true }, orderBy: { matchScore: "desc" } },
      platforms: true,
    },
  })

  if (!event) return NextResponse.json({ error: "No encontrado." }, { status: 404 })

  return NextResponse.json(event)
}
