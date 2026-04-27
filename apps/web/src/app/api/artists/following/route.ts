import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@konzert/database"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const followed = await prisma.userArtist.findMany({
    where: { userId: session.user.id },
    include: { artist: { select: { id: true, name: true, imageUrl: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(followed.map((ua) => ua.artist))
}
