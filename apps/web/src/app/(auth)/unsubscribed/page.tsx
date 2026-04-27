import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export const metadata = { title: "Desuscripción exitosa — Konzert" }

export default function UnsubscribedPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <CardTitle>Listo</CardTitle>
        <CardDescription>
          Actualizamos tus preferencias. Ya no recibirás ese tipo de notificaciones.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center text-sm text-muted-foreground">
        Puedes volver a activarlas en cualquier momento desde tu perfil.
      </CardContent>
      <CardFooter className="justify-center gap-4 text-sm">
        <Link href="/profile/notifications" className="text-foreground font-medium hover:underline">
          Gestionar notificaciones
        </Link>
        <Link href="/map" className="text-muted-foreground hover:text-foreground transition-colors">
          Ir al mapa
        </Link>
      </CardFooter>
    </Card>
  )
}
