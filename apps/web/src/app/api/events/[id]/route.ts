import { NextResponse } from "next/server"
import { prisma } from "@konzert/database"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id, status: "PUBLISHED" },
    include: {
      venue: true,
      artists: { include: { artist: true }, orderBy: { matchScore: "desc" } },
      platforms: true,
    },
  })

  if (!event) return NextResponse.json({ error: "No encontrado." }, { status: 404 })

  return NextResponse.json(event)
}
