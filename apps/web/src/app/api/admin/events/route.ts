import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@konzert/database"
import type { EventStatus, SaleStatus, Platform } from "@konzert/database"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return null
  if ((session.user as { role?: string }).role !== "ADMIN") return null
  return session.user as { id: string; role: string }
}

export async function GET(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") as EventStatus | null
  const platform = searchParams.get("platform") as Platform | null
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const pageSize = 20

  const where = {
    ...(status ? { status } : {}),
    ...(platform ? { platforms: { some: { platform } } } : {}),
    ...(from ? { dateStart: { gte: new Date(from) } } : {}),
    ...(to ? { dateStart: { lte: new Date(to) } } : {}),
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        venue: { select: { id: true, name: true } },
        artists: { include: { artist: { select: { id: true, name: true } } } },
        platforms: { select: { platform: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.event.count({ where }),
  ])

  return NextResponse.json({ events, total, page, pageSize })
}

export async function POST(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = (await req.json()) as {
    title: string
    description?: string
    imageUrl?: string
    dateStart: string
    dateEnd?: string
    venueId: string
    status: EventStatus
    saleStatus: SaleStatus
    priceMin?: number
    priceMax?: number
    ticketUrl?: string
    ticketPlatform?: Platform
  }

  if (!body.title || !body.dateStart || !body.venueId) {
    return NextResponse.json({ error: "Faltan campos requeridos." }, { status: 422 })
  }

  const event = await prisma.event.create({
    data: {
      title: body.title,
      description: body.description,
      imageUrl: body.imageUrl,
      dateStart: new Date(body.dateStart),
      dateEnd: body.dateEnd ? new Date(body.dateEnd) : undefined,
      venueId: body.venueId,
      status: body.status ?? "DRAFT",
      saleStatus: body.saleStatus ?? "UPCOMING",
      priceMin: body.priceMin,
      priceMax: body.priceMax,
      manuallyEdited: true,
      ...(body.ticketUrl && body.ticketPlatform
        ? {
            platforms: {
              create: { platform: body.ticketPlatform, ticketUrl: body.ticketUrl },
            },
          }
        : {}),
    },
  })

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "event.create",
      targetType: "Event",
      targetId: event.id,
      metadata: { title: event.title, manual: true },
    },
  })

  return NextResponse.json(event, { status: 201 })
}
