"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { validatePasswordStrength } from "@/lib/password-validation"

function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <li className="flex items-center gap-1.5 text-xs">
      {met ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-[#06b6d4] shrink-0" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-white/20 shrink-0" />
      )}
      <span className={met ? "text-[#06b6d4]" : "text-white/40"}>{label}</span>
    </li>
  )
}

export function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const strength = validatePasswordStrength(newPassword)
  const showRequirements = newPassword.length > 0

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!strength.isValid) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    const form = new FormData(e.currentTarget)
    const currentPassword = form.get("currentPassword") as string
    const confirmPassword = form.get("confirmPassword") as string

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden.")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) {
        setError(data.error ?? "Ocurrió un error. Intenta de nuevo.")
        return
      }
      setSuccess(true)
      ;(e.target as HTMLFormElement).reset()
      setNewPassword("")
    } catch {
      setError("Error de conexión. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-xl bg-[#06b6d4]/10 border border-[#06b6d4]/20 px-4 py-2.5 text-sm text-[#06b6d4]">
          Contraseña actualizada correctamente.
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currentPassword">Contraseña actual</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newPassword">Nueva contraseña</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        {showRequirements && (
          <ul className="mt-1 flex flex-col gap-1">
            <Requirement met={strength.minLength} label="Mínimo 8 caracteres" />
            <Requirement met={strength.hasUppercase} label="Al menos 1 mayúscula" />
            <Requirement met={strength.hasLowercase} label="Al menos 1 minúscula" />
            <Requirement met={strength.hasNumber} label="Al menos 1 número" />
            <Requirement met={strength.hasSpecial} label="Al menos 1 carácter especial (!@#$%^&*)" />
          </ul>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full mt-1"
        disabled={loading || !strength.isValid}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Cambiar contraseña
      </Button>
    </form>
  )
}
