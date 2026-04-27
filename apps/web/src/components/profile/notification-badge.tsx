"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface ApiResponse {
  unreadCount: number
}

export function NotificationNavLink() {
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    async function fetchCount() {
      const res = await fetch("/api/user/notifications?unread=true").catch(() => null)
      if (!res?.ok) return
      const data = (await res.json()) as ApiResponse
      setUnread(data.unreadCount)
    }

    fetchCount()
    const id = setInterval(fetchCount, 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <Link href="/profile/notifications" className="relative hover:text-white transition-colors">
      Notificaciones
      {unread > 0 && (
        <span className="absolute -top-1.5 -right-3.5 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-[#06b6d4] text-[10px] font-bold text-black leading-none">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  )
}
