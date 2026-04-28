import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@konzert/database"
import type { EventStatus, SaleStatus } from "@konzert/database"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return null
  if ((session.user as { role?: string }).role !== "ADMIN") return null
  return session.user as { id: string; role: string }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const event = await prisma.event.findUnique({
    where: { id: id },
    include: {
      venue: true,
      artists: { include: { artist: true } },
      platforms: true,
    },
  })

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(event)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = (await req.json()) as {
    title?: string
    description?: string
    imageUrl?: string
    dateStart?: string
    dateEnd?: string
    venueId?: string
    status?: EventStatus
    saleStatus?: SaleStatus
    priceMin?: number | null
    priceMax?: number | null
    action?: "reject" | "publish" | "draft"
  }

  const existing = await prisma.event.findUnique({ where: { id: id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  let status: EventStatus | undefined = body.status
  let action = body.action

  if (action === "reject") status = "REJECTED"
  if (action === "publish") status = "PUBLISHED"
  if (action === "draft") status = "DRAFT"

  const updated = await prisma.event.update({
    where: { id: id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl } : {}),
      ...(body.dateStart !== undefined ? { dateStart: new Date(body.dateStart) } : {}),
      ...(body.dateEnd !== undefined
        ? { dateEnd: body.dateEnd ? new Date(body.dateEnd) : null }
        : {}),
      ...(body.venueId !== undefined ? { venueId: body.venueId } : {}),
      ...(body.saleStatus !== undefined ? { saleStatus: body.saleStatus } : {}),
      ...(body.priceMin !== undefined ? { priceMin: body.priceMin } : {}),
      ...(body.priceMax !== undefined ? { priceMax: body.priceMax } : {}),
      ...(status !== undefined ? { status } : {}),
      manuallyEdited: true,
    },
  })

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: action ? `event.${action}` : "event.edit",
      targetType: "Event",
      targetId: id,
      metadata: { previous: { status: existing.status }, next: { status: updated.status } },
    },
  })

  return NextResponse.json(updated)
}
