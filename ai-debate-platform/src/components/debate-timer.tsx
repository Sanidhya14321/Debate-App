"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface DebateTimerProps {
  durationInSeconds: number
  onTimeUp: () => void
}

export function DebateTimer({ durationInSeconds, onTimeUp }: DebateTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationInSeconds)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsActive(false)
            onTimeUp()
            return 0
          }
          return time - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, onTimeUp])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const getTimerColor = () => {
    if (timeLeft <= 30) return "text-destructive"
    if (timeLeft <= 60) return "text-accent"
    return "text-primary"
  }

  return (
    <div className={`flex items-center space-x-2 ${getTimerColor()}`}>
      <Clock className="h-5 w-5" />
      <span className="text-2xl font-mono font-bold">
        {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  )
}
