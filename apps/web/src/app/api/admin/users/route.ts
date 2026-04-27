import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@konzert/database"
import type { UserStatus } from "@konzert/database"

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
  const statusParam = searchParams.get("status")
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const pageSize = 25

  const statusFilter: UserStatus | undefined =
    statusParam === "ACTIVE" || statusParam === "BLOCKED" ? statusParam : undefined

  const where = {
    deletedAt: null,
    ...(q ? { email: { contains: q, mode: "insensitive" as const } } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  }

  const [rawUsers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ])

  const users = await Promise.all(
    rawUsers.map(async (u) => {
      const [lastSession, artistCount] = await Promise.all([
        prisma.session.findFirst({
          where: { userId: u.id },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        }),
        prisma.userArtist.count({ where: { userId: u.id } }),
      ])
      return {
        id: u.id,
        email: u.email,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        lastSession: lastSession?.createdAt ?? null,
        followedArtists: artistCount,
      }
    })
  )

  return NextResponse.json({ users, total, page, pageSize })
}
