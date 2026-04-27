import { NextResponse } from "next/server"
import { prisma } from "@konzert/database"
import { verifyUnsubscribeToken } from "@/lib/unsubscribe"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")
  const userId = searchParams.get("userId")
  const type = searchParams.get("type") // "all" | "EVENT_ANNOUNCED" | "SALE_OPENED"

  if (!token || !userId) {
    return new Response("Enlace inválido.", { status: 400 })
  }

  if (!verifyUnsubscribeToken(token, userId)) {
    return new Response("Token inválido.", { status: 403 })
  }

  const update =
    type === "EVENT_ANNOUNCED"
      ? { notifyEventAnnounced: false }
      : type === "SALE_OPENED"
        ? { notifySaleOpened: false }
        : { notifyEventAnnounced: false, notifySaleOpened: false }

  await prisma.user.update({ where: { id: userId }, data: update })

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  return NextResponse.redirect(`${baseUrl}/unsubscribed`, { status: 302 })
}
