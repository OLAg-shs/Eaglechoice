"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type ToastVariant = "default" | "destructive" | "success"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
}

interface ToastItemProps extends ToastProps {
  onDismiss: (id: string) => void
}

const variantStyles: Record<ToastVariant, string> = {
  default: "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111111] text-gray-950 dark:text-gray-100",
  destructive: "border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-200",
  success: "border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-400",
}

function ToastItem({ id, title, description, variant = "default", onDismiss }: ToastItemProps) {
  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all",
        variantStyles[variant]
      )}
      role="alert"
    >
      <div className="grid gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && (
          <div className="text-sm opacity-90">{description}</div>
        )}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-current opacity-50 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}

export { ToastItem }
