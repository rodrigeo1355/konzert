import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata = { title: "Nueva contraseña — Konzert" }

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  if (!searchParams.token) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl">Enlace inválido</CardTitle>
          <CardDescription>Este enlace expiró o ya fue utilizado.</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          <Link href="/forgot-password" className="text-[#06b6d4] font-semibold hover:text-[#22d3ee] transition-colors">
            Solicitar un nuevo enlace
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">Nueva contraseña</CardTitle>
        <CardDescription>Elige una contraseña segura para tu cuenta.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm token={searchParams.token} />
      </CardContent>
    </Card>
  )
}
