"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react"

type ScraperStatus = "SUCCESS" | "PARTIAL" | "FAILED"

interface ScraperRun {
  id: string
  platform: string
  status: ScraperStatus
  eventsNew: number
  eventsUpdated: number
  errorMessage: string | null
  durationMs: number | null
  startedAt: string
  finishedAt: string | null
}

interface PlatformSummary {
  platform: string
  latest: ScraperRun | null
  nextRun: string | null
}

interface DashboardData {
  platforms: PlatformSummary[]
  recentRuns: ScraperRun[]
}

const STATUS_ICON: Record<ScraperStatus, React.ReactNode> = {
  SUCCESS: <CheckCircle className="h-4 w-4 text-emerald-400" />,
  PARTIAL: <AlertCircle className="h-4 w-4 text-yellow-400" />,
  FAILED: <XCircle className="h-4 w-4 text-red-400" />,
}

const STATUS_LABEL: Record<ScraperStatus, string> = {
  SUCCESS: "OK",
  PARTIAL: "Parcial",
  FAILED: "Error",
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function fmtMs(ms: number | null) {
  if (ms == null) return "—"
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function RunDetail({ run }: { run: ScraperRun }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors text-left"
      >
        {STATUS_ICON[run.status]}
        <span className="text-sm text-white/70 font-medium">{run.platform}</span>
        <span className="text-xs text-white/30">{fmtDate(run.startedAt)}</span>
        <span className="ml-auto flex items-center gap-3 text-xs text-white/40">
          <span className="text-emerald-400/70">+{run.eventsNew}</span>
          <span className="text-[#06b6d4]/70">~{run.eventsUpdated}</span>
          <span>{fmtMs(run.durationMs)}</span>
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-3">
            <div>
              <dt className="text-white/30 text-xs">Inicio</dt>
              <dd className="text-white/60">{fmtDate(run.startedAt)}</dd>
            </div>
            <div>
              <dt className="text-white/30 text-xs">Fin</dt>
              <dd className="text-white/60">{run.finishedAt ? fmtDate(run.finishedAt) : "—"}</dd>
            </div>
            <div>
              <dt className="text-white/30 text-xs">Eventos nuevos</dt>
              <dd className="text-emerald-400">{run.eventsNew}</dd>
            </div>
            <div>
              <dt className="text-white/30 text-xs">Eventos actualizados</dt>
              <dd className="text-[#06b6d4]">{run.eventsUpdated}</dd>
            </div>
          </dl>
          {run.errorMessage && (
            <div className="mt-2">
              <p className="text-xs text-white/30 mb-1">Error</p>
              <pre className="text-xs text-red-400 bg-red-400/5 border border-red-400/10 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">
                {run.errorMessage}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function ScraperDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [triggering, setTriggering] = useState<string | null>(null)
  const [pendingPlatform, setPendingPlatform] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/admin/scraper/runs")
    if (res.ok) {
      const d = await res.json() as DashboardData
      setData(d)

      // Stop polling if the pending platform completed a new run
      if (pendingPlatform) {
        const latest = d.platforms.find((p) => p.platform === pendingPlatform)?.latest
        if (latest && Date.now() - new Date(latest.startedAt).getTime() < 10 * 60 * 1000) {
          setPendingPlatform(null)
        }
      }
    }
  }, [pendingPlatform])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  useEffect(() => {
    if (pendingPlatform) {
      pollRef.current = setInterval(() => void fetchData(), 5000)
    } else {
      if (pollRef.current) clearInterval(pollRef.current)
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [pendingPlatform, fetchData])

  async function triggerScraper(platform: string) {
    setTriggering(platform)
    const res = await fetch("/api/admin/scraper/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform }),
    })
    setTriggering(null)
    if (res.ok) {
      setPendingPlatform(platform)
      await fetchData()
    }
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20 text-white/30 text-sm gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando…
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Estado por plataforma */}
      <div>
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">
          Estado por plataforma
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.platforms.map(({ platform, latest, nextRun }) => (
            <div
              key={platform}
              className="rounded-2xl border border-white/10 bg-[#111111] p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white/80">{platform}</span>
                {latest ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium">
                    {STATUS_ICON[latest.status]}
                    {STATUS_LABEL[latest.status]}
                  </span>
                ) : (
                  <span className="text-xs text-white/30">Sin datos</span>
                )}
              </div>

              {latest && (
                <dl className="flex flex-col gap-1 text-xs text-white/40">
                  <div className="flex justify-between">
                    <dt>Última ejecución</dt>
                    <dd className="text-white/60">{fmtDate(latest.startedAt)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Nuevos / Actualizados</dt>
                    <dd>
                      <span className="text-emerald-400/80">{latest.eventsNew}</span>
                      {" / "}
                      <span className="text-[#06b6d4]/80">{latest.eventsUpdated}</span>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Próxima ejecución</dt>
                    <dd className="text-white/60">
                      {nextRun ? fmtDate(nextRun) : "—"}
                    </dd>
                  </div>
                </dl>
              )}

              <Button
                size="sm"
                variant={pendingPlatform === platform ? "secondary" : "outline"}
                disabled={!!triggering || pendingPlatform === platform}
                onClick={() => void triggerScraper(platform)}
                className="mt-auto"
              >
                {triggering === platform ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : pendingPlatform === platform ? (
                  <>
                    <Clock className="h-3.5 w-3.5" />
                    En progreso…
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    Ejecutar ahora
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Log de ejecuciones */}
      <div>
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">
          Historial de ejecuciones
        </h2>
        {data.recentRuns.length === 0 ? (
          <p className="text-sm text-white/30">No hay ejecuciones registradas.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {data.recentRuns.map((run) => (
              <RunDetail key={run.id} run={run} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
