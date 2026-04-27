import { NextResponse } from "next/server"

// Tracking sin PII — solo eventId y platform
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { platform } = await req.json() as { platform?: string }

  // En producción: enviar a analytics (Plausible, PostHog, etc.)
  console.log(`[track] event=${params.id} platform=${platform ?? "unknown"}`)

  return NextResponse.json({ ok: true })
}
