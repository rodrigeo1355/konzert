"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, TriangleAlert } from "lucide-react"

export function DeleteAccountDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const password = form.get("password") as string

    try {
      const res = await fetch("/api/user/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) {
        setError(data.error ?? "Ocurrió un error. Intenta de nuevo.")
        return
      }
      await signOut({ redirect: false })
      router.push("/")
      router.refresh()
    } catch {
      setError("Error de conexión. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
        onClick={() => setOpen(true)}
      >
        Eliminar cuenta
      </Button>
    )
  }

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <TriangleAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-white">¿Estás seguro?</p>
          <p className="text-xs text-white/40">
            Esta acción es irreversible. Se eliminarán tu cuenta y todos tus datos.
          </p>
        </div>
      </div>

      <form onSubmit={handleDelete} className="flex flex-col gap-3">
        {error && (
          <p className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="deletePassword">Ingresa tu contraseña para confirmar</Label>
          <Input
            id="deletePassword"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => { setOpen(false); setError(null) }}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="destructive"
            className="flex-1"
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sí, eliminar cuenta
          </Button>
        </div>
      </form>
    </div>
  )
}
