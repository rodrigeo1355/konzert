"use client"

import { useState } from "react"
import { DayPicker } from "react-day-picker"
import * as Popover from "@radix-ui/react-popover"
import { CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Label } from "@/components/ui/label"

interface DatePickerProps {
  label: string
  value: string
  onChange: (iso: string) => void
  minDate?: Date
}

function parseISO(iso: string): Date | undefined {
  if (!iso) return undefined
  const parts = iso.split("-")
  const y = Number(parts[0])
  const m = Number(parts[1])
  const d = Number(parts[2])
  return new Date(y, m - 1, d)
}

function toISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function formatDisplay(iso: string): string {
  if (!iso) return ""
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y}`
}

export function DatePicker({ label, value, onChange, minDate }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = parseISO(value)

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <div className="relative flex items-center">
          <Popover.Trigger asChild>
            <button
              className={[
                "flex h-8 w-full items-center gap-1.5 rounded-md border px-2 text-xs transition-colors text-left",
                "bg-white/5 border-white/10",
                value ? "text-white" : "text-white/30",
                "hover:border-white/25 focus:outline-none focus:border-[#06b6d4]/50",
              ].join(" ")}
            >
              <CalendarIcon className="h-3 w-3 shrink-0 text-white/30" />
              <span className="flex-1">{value ? formatDisplay(value) : "dd/mm/aaaa"}</span>
            </button>
          </Popover.Trigger>
          {value && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onChange("")
              }}
              className="absolute right-2 text-white/30 hover:text-white/70 transition-colors"
              aria-label="Limpiar fecha"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            onInteractOutside={() => setOpen(false)}
            onEscapeKeyDown={() => setOpen(false)}
            className="z-50 rounded-xl border border-white/10 bg-[#111111] p-3 shadow-xl"
          >
            <DayPicker
              mode="single"
              selected={selected}
              defaultMonth={selected ?? new Date()}
              onSelect={(date) => {
                if (date) {
                  onChange(toISO(date))
                  setOpen(false)
                }
              }}
              disabled={minDate ? { before: minDate } : undefined}
              components={{
                Chevron: ({ orientation }) =>
                  orientation === "left" ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  ),
              }}
              classNames={{
                root: "text-white select-none",
                months: "flex flex-col",
                month: "flex flex-col gap-3",
                month_caption: "flex items-center justify-between px-1",
                caption_label: "text-sm font-medium text-white",
                nav: "flex items-center gap-1",
                button_previous:
                  "p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors",
                button_next:
                  "p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors",
                weekdays: "flex",
                weekday: "w-8 text-center text-[11px] text-white/30 font-normal pb-1",
                weeks: "flex flex-col gap-0.5",
                week: "flex",
                day: "p-0",
                day_button: [
                  "w-8 h-8 rounded-full text-xs transition-colors flex items-center justify-center",
                  "text-white/80 hover:bg-white/10",
                  "data-[selected]:bg-[#06b6d4]/20 data-[selected]:text-[#06b6d4] data-[selected]:hover:bg-[#06b6d4]/30",
                  "data-[today]:font-bold data-[today]:text-white",
                  "data-[disabled]:opacity-25 data-[disabled]:cursor-not-allowed data-[disabled]:hover:bg-transparent",
                  "data-[outside-month]:opacity-20",
                ].join(" "),
                hidden: "invisible",
              }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
