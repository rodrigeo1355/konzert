import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata = { title: "Recuperar contraseña — Konzert" }

export default function ForgotPasswordPage() {
  return (
    <Card className="w-full">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">Recuperar contraseña</CardTitle>
        <CardDescription>
          Te enviaremos un enlace para restablecer tu contraseña.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        <Link href="/login" className="hover:text-[#06b6d4] transition-colors">
          Volver al inicio de sesión
        </Link>
      </CardFooter>
    </Card>
  )
}
