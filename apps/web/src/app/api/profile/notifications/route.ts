import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@konzert/database"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { notifyEventAnnounced: true, notifySaleOpened: true },
  })

  return NextResponse.json(user)
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const body = await req.json() as { notifyEventAnnounced?: boolean; notifySaleOpened?: boolean }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(typeof body.notifyEventAnnounced === "boolean" && {
        notifyEventAnnounced: body.notifyEventAnnounced,
      }),
      ...(typeof body.notifySaleOpened === "boolean" && {
        notifySaleOpened: body.notifySaleOpened,
      }),
    },
    select: { notifyEventAnnounced: true, notifySaleOpened: true },
  })

  return NextResponse.json(updated)
}
