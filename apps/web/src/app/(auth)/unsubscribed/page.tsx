import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export const metadata = { title: "Desuscripción exitosa — Konzert" }

export default function UnsubscribedPage() {
  return (
    <Card className="w-full">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <CheckCircle2 className="h-10 w-10 text-[#06b6d4]" />
        </div>
        <CardTitle className="text-xl">Listo</CardTitle>
        <CardDescription>
          Actualizamos tus preferencias. Ya no recibirás ese tipo de notificaciones.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center text-sm text-muted-foreground pb-2">
        Puedes volver a activarlas en cualquier momento desde tu perfil.
      </CardContent>
      <CardFooter className="justify-center gap-6 text-sm">
        <Link href="/profile/notifications" className="text-[#06b6d4] font-semibold hover:text-[#22d3ee] transition-colors">
          Gestionar notificaciones
        </Link>
        <Link href="/map" className="text-muted-foreground hover:text-[#06b6d4] transition-colors">
          Ir al mapa
        </Link>
      </CardFooter>
    </Card>
  )
}
