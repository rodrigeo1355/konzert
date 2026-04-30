"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useTransition } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { SlidersHorizontal, X } from "lucide-react"
import { DatePicker } from "@/components/map/date-picker"

export function EventsFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const from = searchParams.get("from") ?? ""
  const to = searchParams.get("to") ?? ""
  const maxPrice = searchParams.get("maxPrice") ?? ""

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete("page")
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      })
    },
    [router, pathname, searchParams]
  )

  const clearAll = useCallback(() => {
    startTransition(() => {
      router.replace(pathname, { scroll: false })
    })
  }, [router, pathname])

  const hasActiveFilters = from || to || maxPrice

  return (
    <div className="flex flex-wrap items-end gap-3">
      <DatePicker
        label="Desde"
        value={from}
        onChange={(iso) => update("from", iso)}
      />
      <DatePicker
        label="Hasta"
        value={to}
        onChange={(iso) => update("to", iso)}
        minDate={from ? new Date(from + "T00:00:00") : undefined}
      />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="maxPrice" className="text-xs text-white/50">
          Precio máx. (CLP)
        </Label>
        <Input
          id="maxPrice"
          type="number"
          min={0}
          step={1000}
          placeholder="Sin límite"
          value={maxPrice}
          onChange={(e) => update("maxPrice", e.target.value)}
          className="h-8 text-xs w-36"
        />
      </div>
      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 h-8 text-xs text-white/40 hover:text-[#06b6d4] transition-colors pb-0.5"
        >
          <X className="h-3 w-3" />
          Limpiar filtros
        </button>
      )}
      {isPending && (
        <span className="text-xs text-white/30 pb-1">Actualizando…</span>
      )}
    </div>
  )
}
