import { NotificationPreferences } from "@/components/profile/notification-preferences"

export const metadata = { title: "Notificaciones — Konzert" }

export default function ProfileNotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Preferencias de notificación</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Elige qué emails quieres recibir.
        </p>
      </div>
      <NotificationPreferences />
    </div>
  )
}
