import { NextResponse } from "next/server"

// Tracking sin PII — solo eventId y platform
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { platform } = await req.json() as { platform?: string }

  // En producción: enviar a analytics (Plausible, PostHog, etc.)
  console.log(`[track] event=${id} platform=${platform ?? "unknown"}`)

  return NextResponse.json({ ok: true })
}
