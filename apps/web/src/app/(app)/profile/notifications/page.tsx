import { NotificationList } from "@/components/profile/notifications-list"
import { NotificationPreferences } from "@/components/profile/notification-preferences"

export const metadata = { title: "Notificaciones — Konzert" }

export default function ProfileNotificationsPage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-white">Notificaciones</h1>
          <p className="text-sm text-white/40 mt-1">
            Actividad reciente de tus artistas favoritos.
          </p>
        </div>
        <NotificationList />
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-base font-semibold text-white">Preferencias de email</h2>
          <p className="text-sm text-white/40 mt-1">
            Elige qué emails quieres recibir.
          </p>
        </div>
        <NotificationPreferences />
      </div>
    </div>
  )
}
