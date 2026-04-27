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

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; callbackUrl?: string }
}) {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Konzert</CardTitle>
        <CardDescription>Ingresa a tu cuenta</CardDescription>
      </CardHeader>
      <CardContent>
        {searchParams.error === "ACCOUNT_LOCKED" && (
          <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Tu cuenta fue bloqueada por múltiples intentos fallidos. Intenta en 15 minutos.
          </p>
        )}
        {searchParams.error === "CredentialsSignin" && (
          <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Email o contraseña incorrectos.
          </p>
        )}
        <LoginForm callbackUrl={searchParams.callbackUrl} />
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm text-muted-foreground">
        <Link href="/forgot-password" className="hover:text-foreground transition-colors">
          ¿Olvidaste tu contraseña?
        </Link>
        <span>
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-foreground font-medium hover:underline">
            Crear cuenta
          </Link>
        </span>
      </CardFooter>
    </Card>
  )
}
