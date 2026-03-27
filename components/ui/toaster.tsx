"use client"

import { ToastContext, useToast, useToastState } from "./use-toast"
import { ToastItem } from "./toast"

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const state = useToastState()

  return (
    <ToastContext.Provider value={state}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  )
}

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onDismiss={dismiss} />
      ))}
    </div>
  )
}
