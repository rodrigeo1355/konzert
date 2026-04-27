import { NotificationPreferences } from "@/components/profile/notification-preferences"

export const metadata = { title: "Notificaciones — Konzert" }

export default function ProfileNotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Preferencias de notificación</h1>
        <p className="text-sm text-white/40 mt-1">
          Elige qué emails quieres recibir.
        </p>
      </div>
      <NotificationPreferences />
    </div>
  )
}
