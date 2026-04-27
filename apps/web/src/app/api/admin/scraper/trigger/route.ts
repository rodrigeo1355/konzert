import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { Queue } from "bullmq"
import IORedis from "ioredis"
import { prisma } from "@konzert/database"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return null
  if ((session.user as { role?: string }).role !== "ADMIN") return null
  return session.user as { id: string }
}

const VALID_PLATFORMS = ["PUNTOTICKET", "TICKETMASTER", "PASSLINE", "JOINNUS", "FINTIX"] as const
type PlatformKey = (typeof VALID_PLATFORMS)[number]

let redis: IORedis | null = null
let scraperQueue: Queue | null = null

function getQueue(): Queue {
  if (!scraperQueue) {
    redis = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: null,
    })
    scraperQueue = new Queue("scraper", { connection: redis })
  }
  return scraperQueue
}

export async function POST(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = (await req.json()) as { platform?: string }
  const platform = body.platform as PlatformKey | undefined

  if (!platform || !(VALID_PLATFORMS as readonly string[]).includes(platform)) {
    return NextResponse.json({ error: "Plataforma inválida." }, { status: 422 })
  }

  const queue = getQueue()
  const job = await queue.add("scrape", { platform }, { priority: 1 })

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "scraper.trigger",
      targetType: "ScraperRun",
      targetId: job.id ?? platform,
      metadata: { platform },
    },
  })

  return NextResponse.json({ jobId: job.id, platform })
}
