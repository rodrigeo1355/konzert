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

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  if (!searchParams.token) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Enlace inválido</CardTitle>
          <CardDescription>Este enlace ya no es válido.</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center text-sm">
          <Link href="/forgot-password" className="text-foreground font-medium hover:underline">
            Solicitar un nuevo enlace
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Nueva contraseña</CardTitle>
        <CardDescription>Elige una contraseña segura para tu cuenta.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm token={searchParams.token} />
      </CardContent>
    </Card>
  )
}
