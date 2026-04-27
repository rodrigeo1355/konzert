import { Suspense } from "react"
import { UsersTable } from "@/components/admin/users-table"

export const metadata = { title: "Usuarios — Backoffice Konzert" }

export default function BackofficeUsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Gestión de usuarios</h1>
        <p className="text-sm text-white/40 mt-1">
          Bloquea cuentas y fuerza resets de contraseña.
        </p>
      </div>
      <Suspense>
        <UsersTable />
      </Suspense>
    </div>
  )
}
