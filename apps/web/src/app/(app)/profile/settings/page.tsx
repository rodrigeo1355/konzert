import { ChangePasswordForm } from "@/components/profile/change-password-form"
import { DeleteAccountDialog } from "@/components/profile/delete-account-dialog"

export const metadata = { title: "Configuración — Konzert" }

export default function ProfileSettingsPage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-white">Configuración</h1>
          <p className="text-sm text-white/40 mt-1">Gestiona la seguridad de tu cuenta.</p>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-white">Cambiar contraseña</h2>
          <ChangePasswordForm />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">Zona de peligro</h2>
          <p className="text-sm text-white/40 mt-1">
            Eliminar tu cuenta es una acción permanente e irreversible.
          </p>
        </div>
        <DeleteAccountDialog />
      </div>
    </div>
  )
}
