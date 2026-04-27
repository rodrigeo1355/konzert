import { NextResponse } from "next/server"
import { prisma } from "@konzert/database"
import { hashPassword, validatePasswordStrength } from "@/lib/password"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown"
  const { allowed } = checkRateLimit(`register:${ip}`, 5, 60_000)

  if (!allowed) {
    return NextResponse.json({ error: "Demasiados intentos. Intenta en un minuto." }, { status: 429 })
  }

  const body = await req.json() as { email?: string; password?: string }
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json({ error: "Email y contraseña son requeridos." }, { status: 400 })
  }

  const strength = validatePasswordStrength(password)
  if (!strength.isValid) {
    return NextResponse.json({ error: "La contraseña no cumple los requisitos." }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese email." }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)

  await prisma.user.create({
    data: { email, passwordHash },
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}
