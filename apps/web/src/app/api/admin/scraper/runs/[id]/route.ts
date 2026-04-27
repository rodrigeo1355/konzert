import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@konzert/database"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return null
  if ((session.user as { role?: string }).role !== "ADMIN") return null
  return session.user
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const run = await prisma.scraperRun.findUnique({ where: { id: params.id } })
  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(run)
}
