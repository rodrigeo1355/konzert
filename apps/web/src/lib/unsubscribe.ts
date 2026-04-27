import { createHmac } from "crypto"

const secret = () => process.env.AUTH_SECRET ?? "dev-secret-change-in-production"

export function generateUnsubscribeToken(userId: string): string {
  return createHmac("sha256", secret()).update(userId).digest("hex")
}

export function verifyUnsubscribeToken(token: string, userId: string): boolean {
  const expected = generateUnsubscribeToken(userId)
  return token === expected
}

export function buildUnsubscribeUrl(userId: string, baseUrl: string): string {
  const token = generateUnsubscribeToken(userId)
  return `${baseUrl}/api/unsubscribe?token=${token}&userId=${userId}`
}
