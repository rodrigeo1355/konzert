import { RegisterForm } from "@/components/auth/register-form"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata = { title: "Crear cuenta — Konzert" }

export default function RegisterPage() {
  return (
    <Card className="w-full">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">Crear cuenta</CardTitle>
        <CardDescription>Empieza a seguir tus artistas favoritos</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm text-muted-foreground">
        <span>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-[#06b6d4] font-semibold hover:text-[#22d3ee] transition-colors">
            Ingresar
          </Link>
        </span>
      </CardFooter>
    </Card>
  )
}
