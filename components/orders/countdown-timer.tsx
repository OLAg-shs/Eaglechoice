"use client"

import { useState, useEffect } from "react"
import { Clock, AlertCircle } from "lucide-react"

export function CountdownTimer({ expiresAt }: { expiresAt?: string }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (!expiresAt) return

    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime()
      
      if (difference <= 0) {
        setIsExpired(true)
        setTimeLeft(null)
        return
      }

      setTimeLeft({
        d: Math.floor(difference / (1000 * 60 * 60 * 24)),
        h: Math.floor((difference / (1000 * 60 * 60)) % 24),
        m: Math.floor((difference / 1000 / 60) % 60),
        s: Math.floor((difference / 1000) % 60)
      })
      setIsExpired(false)
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [expiresAt])

  if (!expiresAt) return null

  if (isExpired) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100 mt-2 w-max">
        <AlertCircle className="h-3.5 w-3.5" />
        Deadline Expired
      </div>
    )
  }

  if (!timeLeft) return null

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-100 mt-2 w-max">
      <Clock className="h-3.5 w-3.5" />
      <span>
        <span className="font-bold">{timeLeft.d}d</span> {timeLeft.h}h {timeLeft.m}m remaining
      </span>
    </div>
  )
}
