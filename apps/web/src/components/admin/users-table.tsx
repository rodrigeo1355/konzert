"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ShieldOff, ShieldCheck, KeyRound, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { useDebounce } from "@/lib/use-debounce"

type UserStatus = "ACTIVE" | "BLOCKED"

interface AdminUser {
  id: string
  email: string
  role: string
  status: UserStatus
  createdAt: string
  lastSession: string | null
  followedArtists: number
}

function fmtDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  })
}

export function UsersTable() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)

  const q = searchParams.get("q") ?? ""
  const status = searchParams.get("status") ?? ""
  const page = parseInt(searchParams.get("page") ?? "1")

  const debouncedQ = useDebounce(q, 300)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (debouncedQ) params.set("q", debouncedQ)
    if (status) params.set("status", status)
    params.set("page", String(page))

    const res = await fetch(`/api/admin/users?${params}`)
    if (res.ok) {
      const data = await res.json() as { users: AdminUser[]; total: number }
      setUsers(data.users)
      setTotal(data.total)
    }
    setLoading(false)
  }, [debouncedQ, status, page])

  useEffect(() => { void fetchUsers() }, [fetchUsers])

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete("page")
    router.push(`/backoffice/users?${params}`)
  }

  function setPage(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(p))
    router.push(`/backoffice/users?${params}`)
  }

  async function doAction(userId: string, action: "block" | "unblock" | "force-reset") {
    setActing(`${userId}:${action}`)
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
    setActing(null)
    void fetchUsers()
  }

  const totalPages = Math.ceil(total / 25)

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
          <Input
            value={q}
            onChange={(e) => setFilter("q", e.target.value)}
            placeholder="Buscar por email…"
            className="pl-8 h-9 text-sm w-64"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setFilter("status", e.target.value)}
          className="h-9 rounded-lg border border-white/10 bg-[#111111] text-sm text-white/70 px-3 focus:outline-none focus:border-[#06b6d4]/50"
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVE">Activos</option>
          <option value="BLOCKED">Bloqueados</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3">Email</th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3 hidden md:table-cell">Registro</th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3 hidden lg:table-cell">Última sesión</th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3 hidden sm:table-cell">Artistas</th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3">Estado</th>
              <th className="text-right text-xs text-white/40 font-medium px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-white/30 text-sm">
                  Cargando…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-white/30 text-sm">
                  No hay usuarios
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white/80 font-medium truncate max-w-[200px]">
                        {user.email}
                      </span>
                      {user.role === "ADMIN" && (
                        <span className="text-[10px] text-[#06b6d4] border border-[#06b6d4]/30 rounded px-1.5 py-0.5 shrink-0">
                          admin
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs hidden md:table-cell">
                    {fmtDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs hidden lg:table-cell">
                    {fmtDate(user.lastSession)}
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs hidden sm:table-cell">
                    {user.followedArtists}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium ${
                        user.status === "ACTIVE" ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {user.status === "ACTIVE" ? "Activo" : "Bloqueado"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      {user.status === "ACTIVE" ? (
                        <button
                          onClick={() => void doAction(user.id, "block")}
                          disabled={!!acting}
                          title="Bloquear cuenta"
                          className="text-red-400/60 hover:text-red-400 transition-colors disabled:opacity-30"
                        >
                          {acting === `${user.id}:block` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ShieldOff className="h-4 w-4" />
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => void doAction(user.id, "unblock")}
                          disabled={!!acting}
                          title="Desbloquear cuenta"
                          className="text-emerald-400/60 hover:text-emerald-400 transition-colors disabled:opacity-30"
                        >
                          {acting === `${user.id}:unblock` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ShieldCheck className="h-4 w-4" />
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => void doAction(user.id, "force-reset")}
                        disabled={!!acting}
                        title="Forzar reset de contraseña"
                        className="text-white/30 hover:text-[#06b6d4] transition-colors disabled:opacity-30"
                      >
                        {acting === `${user.id}:force-reset` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <KeyRound className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between text-sm text-white/40">
        <span>{total} usuarios en total</span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="h-8 w-8 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-white/60 text-xs">{page} / {totalPages}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="h-8 w-8 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
