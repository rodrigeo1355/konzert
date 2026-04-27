import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata = { title: "Ingresar — Konzert" }

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; callbackUrl?: string }
}) {
  return (
    <Card className="w-full">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">Bienvenido de vuelta</CardTitle>
        <CardDescription>Ingresa a tu cuenta de Konzert</CardDescription>
      </CardHeader>
      <CardContent>
        {searchParams.error === "ACCOUNT_LOCKED" && (
          <p className="mb-4 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive border border-destructive/20">
            Cuenta bloqueada por múltiples intentos. Intenta en 15 minutos.
          </p>
        )}
        {searchParams.error === "CredentialsSignin" && (
          <p className="mb-4 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive border border-destructive/20">
            Email o contraseña incorrectos.
          </p>
        )}
        <LoginForm callbackUrl={searchParams.callbackUrl} />
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm text-muted-foreground">
        <Link href="/forgot-password" className="hover:text-[#06b6d4] transition-colors">
          ¿Olvidaste tu contraseña?
        </Link>
        <span>
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-[#06b6d4] font-semibold hover:text-[#22d3ee] transition-colors">
            Crear cuenta
          </Link>
        </span>
      </CardFooter>
    </Card>
  )
}
