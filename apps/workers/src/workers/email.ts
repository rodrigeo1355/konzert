import { Worker } from "bullmq"
import * as React from "react"
import { createHmac } from "node:crypto"
import { prisma } from "@konzert/database"
import { sendEmail, EventAnnouncementEmail, SaleOpenedEmail } from "@konzert/emails"
import { redis } from "../redis"
import { EMAIL_QUEUE, type EmailJobData } from "../queues/email"

const DAILY_LIMIT = 3
const DAILY_LIMIT_KEY = (userId: string) => {
  const date = new Date().toISOString().slice(0, 10)
  return `email:daily:${userId}:${date}`
}

async function isUnderDailyLimit(userId: string): Promise<boolean> {
  const key = DAILY_LIMIT_KEY(userId)
  const count = await redis.incr(key)
  await redis.expireat(key, getEndOfDayTimestamp())
  return count <= DAILY_LIMIT
}

function getEndOfDayTimestamp(): number {
  const end = new Date()
  end.setUTCHours(23, 59, 59, 999)
  return Math.floor(end.getTime() / 1000)
}

function buildUnsubscribeUrl(userId: string, type: string, baseUrl: string): string {
  const secret = process.env.AUTH_SECRET ?? "dev-secret-change-in-production"
  const token = createHmac("sha256", secret).update(userId).digest("hex")
  return `${baseUrl}/api/unsubscribe?token=${token}&userId=${userId}&type=${type}`
}

export const emailWorker = new Worker<EmailJobData>(
  EMAIL_QUEUE,
  async (job) => {
    const { type, userId, eventId } = job.data

    const alreadySent = await prisma.notification.findUnique({
      where: { userId_eventId_type: { userId, eventId, type } },
    })
    if (alreadySent) return

    const underLimit = await isUnderDailyLimit(userId)
    if (!underLimit) {
      console.warn(`[email] Daily limit reached for user ${userId}, skipping`)
      return
    }

    const [user, event] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          notifyEventAnnounced: true,
          notifySaleOpened: true,
        },
      }),
      prisma.event.findUnique({
        where: { id: eventId },
        include: {
          venue: true,
          artists: { include: { artist: true }, take: 1 },
        },
      }),
    ])

    if (!user || !event) return

    // Respetar preferencias de notificación
    if (type === "EVENT_ANNOUNCED" && !user.notifyEventAnnounced) return
    if (type === "SALE_OPENED" && !user.notifySaleOpened) return

    const artistName = event.artists[0]?.artist.name ?? "Artista"
    const eventDate = event.dateStart.toLocaleDateString("es-CL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    const baseUrl = process.env.NEXTAUTH_URL ?? "https://konzert.cl"
    const eventUrl = `${baseUrl}/events/${eventId}`
    const unsubscribeUrl = buildUnsubscribeUrl(userId, type, baseUrl)

    let subject: string
    let template: React.ReactElement

    if (type === "EVENT_ANNOUNCED") {
      subject = `${artistName} anuncia show en Chile`
      template = React.createElement(EventAnnouncementEmail, {
        artistName,
        eventTitle: event.title,
        eventDate,
        venue: event.venue.name,
        eventUrl,
        unsubscribeUrl,
      })
    } else {
      subject = `¡Ya están a la venta las entradas para ${artistName}!`
      template = React.createElement(SaleOpenedEmail, {
        artistName,
        eventTitle: event.title,
        eventDate,
        venue: event.venue.name,
        ticketUrl: eventUrl,
        unsubscribeUrl,
      })
    }

    await sendEmail({ to: user.email, subject, react: template })

    await prisma.notification.create({
      data: { userId, eventId, type },
    })
  },
  {
    connection: redis,
    concurrency: 5,
  }
)
