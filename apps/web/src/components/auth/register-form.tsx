"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
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

export function RegisterForm() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const strength = validatePasswordStrength(password)
  const showRequirements = password.length > 0

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!strength.isValid) return

    setLoading(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const email = form.get("email") as string

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        let message = "Ocurrió un error. Intenta de nuevo."
        try {
          const data = await res.json() as { error?: string }
          message = data.error ?? message
        } catch {
          // response body not JSON — keep generic message
        }
        setError(message)
        return
      }

      const result = await signIn("credentials", { email, password, redirect: false })
      if (result?.error) {
        setError("Cuenta creada, pero no pudimos iniciar sesión automáticamente. Ingresa manualmente.")
        return
      }

      router.push("/")
      router.refresh()
    } catch {
      setError("Error de conexión. Verifica tu internet e intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive">{error}</p>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Contraseña</Label>
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
      <Button type="submit" className="w-full mt-2" disabled={loading || !strength.isValid}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Crear cuenta
      </Button>
    </form>
  )
}
