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

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Konzert</CardTitle>
        <CardDescription>Crea tu cuenta</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground justify-center">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="ml-1 text-foreground font-medium hover:underline">
          Ingresar
        </Link>
      </CardFooter>
    </Card>
  )
}
