import { Resend } from "resend"
import type { ReactElement } from "react"

interface SendEmailOptions {
  to: string | string[]
  subject: string
  react: ReactElement
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  return resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Konzert <noreply@konzert.cl>",
    to,
    subject,
    react,
  })
}
