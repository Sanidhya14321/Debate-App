"use client"

import { useEffect, useState } from "react"

export function AnimatedBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-muted opacity-50" />

      <div
        className="absolute top-20 left-10 w-16 h-16 rounded-full bg-primary/10 animate-float"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="absolute top-40 right-20 w-12 h-12 rounded-full bg-accent/10 animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute bottom-32 left-1/4 w-20 h-20 rounded-full bg-secondary/10 animate-float"
        style={{ animationDelay: "4s" }}
      />
      <div
        className="absolute bottom-20 right-1/3 w-14 h-14 rounded-full bg-primary/10 animate-float"
        style={{ animationDelay: "1s" }}
      />

      <div
        className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-debate-wave"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-accent/20 to-transparent animate-debate-wave"
        style={{ animationDelay: "4s" }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--foreground)/0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--foreground)/0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
    </div>
  )
}
