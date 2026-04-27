"use client"

import { useState, useEffect } from "react"
import { Loader2, Bell, Ticket } from "lucide-react"

interface Prefs {
  notifyEventAnnounced: boolean
  notifySaleOpened: boolean
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={[
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-input",
      ].join(" ")}
    >
      <span
        className={[
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform",
          checked ? "translate-x-5" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  )
}

export function NotificationPreferences() {
  const [prefs, setPrefs] = useState<Prefs | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/profile/notifications")
      .then((r) => r.json() as Promise<Prefs>)
      .then(setPrefs)
      .catch(() => {})
  }, [])

  async function update(key: keyof Prefs, value: boolean) {
    if (!prefs) return
    const next = { ...prefs, [key]: value }
    setPrefs(next) // optimistic
    setSaving(true)

    const res = await fetch("/api/profile/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    })

    if (!res.ok) setPrefs(prefs) // revert
    setSaving(false)
  }

  if (!prefs) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando preferencias…
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {saving && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Loader2 className="h-3 w-3 animate-spin" /> Guardando…
        </p>
      )}

      <div className="flex items-center justify-between rounded-xl border p-4">
        <div className="flex items-start gap-3">
          <Bell className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Evento anunciado</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cuando un artista que sigues anuncia un show en Chile.
            </p>
          </div>
        </div>
        <Toggle
          checked={prefs.notifyEventAnnounced}
          onChange={(v) => update("notifyEventAnnounced", v)}
          disabled={saving}
        />
      </div>

      <div className="flex items-center justify-between rounded-xl border p-4">
        <div className="flex items-start gap-3">
          <Ticket className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Venta abierta</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cuando abren las entradas de un evento de un artista que sigues.
            </p>
          </div>
        </div>
        <Toggle
          checked={prefs.notifySaleOpened}
          onChange={(v) => update("notifySaleOpened", v)}
          disabled={saving}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        También puedes desuscribirte con un clic desde cualquier email que te enviemos.
      </p>
    </div>
  )
}
