"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { validatePasswordStrength } from "@/lib/password"
import Link from "next/link"

function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <li className="flex items-center gap-1.5 text-xs">
      {met ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      )}
      <span className={met ? "text-green-700" : "text-muted-foreground"}>{label}</span>
    </li>
  )
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tokenInvalid, setTokenInvalid] = useState(false)

  const strength = validatePasswordStrength(password)
  const showRequirements = password.length > 0

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!strength.isValid) return

    setLoading(true)
    setError(null)

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })

    const data = await res.json() as { error?: string; ok?: boolean }

    if (!res.ok) {
      if (data.error === "TOKEN_INVALID") {
        setTokenInvalid(true)
      } else {
        setError(data.error ?? "Ocurrió un error.")
      }
      setLoading(false)
      return
    }

    router.push("/login?reset=success")
  }

  if (tokenInvalid) {
    return (
      <div className="text-center flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Este enlace ya no es válido o expiró.</p>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-foreground hover:underline"
        >
          Solicitar un nuevo enlace
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Nueva contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
      <Button type="submit" className="w-full" disabled={loading || !strength.isValid}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Restablecer contraseña
      </Button>
    </form>
  )
}
