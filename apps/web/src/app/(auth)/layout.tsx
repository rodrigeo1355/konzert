import type { ReactNode } from "react"
import Image from "next/image"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-black">
      {/* Glow de fondo */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, #1e3a8a 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #06b6d4 0%, transparent 50%)",
        }}
      />
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8">
        <Image
          src="/konzert-wordmark.svg"
          alt="Konzert"
          width={120}
          height={32}
          priority
        />
        {children}
      </div>
    </div>
  )
}
