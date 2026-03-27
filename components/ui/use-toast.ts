"use client"

import * as React from "react"

import type { ToastProps, ToastVariant } from "./toast"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

type ToastInput = {
  title?: string
  description?: string
  variant?: ToastVariant
}

type ToastContextType = {
  toasts: ToastProps[]
  toast: (input: ToastInput) => string
  dismiss: (id: string) => void
}

export const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

let toastCount = 0

function genId() {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER
  return toastCount.toString()
}

export function useToastState() {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = React.useCallback(
    (input: ToastInput) => {
      const id = genId()
      const newToast: ToastProps = {
        id,
        title: input.title,
        description: input.description,
        variant: input.variant ?? "default",
      }

      setToasts((prev) => {
        const next = [...prev, newToast]
        return next.slice(-TOAST_LIMIT)
      })

      setTimeout(() => {
        dismiss(id)
      }, TOAST_REMOVE_DELAY)

      return id
    },
    [dismiss]
  )

  return React.useMemo(
    () => ({ toasts, toast, dismiss }),
    [toasts, toast, dismiss]
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
