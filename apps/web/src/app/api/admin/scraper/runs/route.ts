import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@konzert/database"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return null
  if ((session.user as { role?: string }).role !== "ADMIN") return null
  return session.user
}

const PLATFORMS = ["PUNTOTICKET", "TICKETMASTER", "PASSLINE", "JOINNUS", "FINTIX"] as const
const INTERVAL_MS = parseInt(process.env.SCRAPER_INTERVAL_HOURS ?? "6") * 60 * 60 * 1000

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const [latestByPlatform, recentRuns] = await Promise.all([
    Promise.all(
      PLATFORMS.map(async (platform) => {
        const latest = await prisma.scraperRun.findFirst({
          where: { platform },
          orderBy: { startedAt: "desc" },
        })
        const nextRun = latest
          ? new Date(latest.startedAt.getTime() + INTERVAL_MS)
          : null
        return { platform, latest, nextRun }
      })
    ),
    prisma.scraperRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 50,
    }),
  ])

  return NextResponse.json({ platforms: latestByPlatform, recentRuns })
}
