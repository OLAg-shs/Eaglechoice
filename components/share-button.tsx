"use client"

import { useState } from "react"
import { Share2, Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ShareButtonProps {
  url: string
  title: string
  variant?: "outline" | "ghost" | "secondary" | "default" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showText?: boolean
}

export function ShareButton({ 
  url, 
  title, 
  variant = "outline", 
  size = "sm", 
  className,
  showText = true 
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    // Try native Web Share API first (mobile)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${title} — Eagle Choice`,
          url,
        })
        return
      } catch (_) {
        // Fall through to clipboard copy
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (err) {
      console.error("Failed to copy!", err)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={cn(
        variant === "outline" && "border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20",
        size !== "icon" && "gap-2 text-xs font-semibold",
        "transition-all",
        className
      )}
      title={copied ? "Copied!" : "Share Link"}
    >
      {copied ? (
        <>
          <Check className={cn("h-3.5 w-3.5 text-green-500", size === "icon" && "h-4 w-4")} />
          {size !== "icon" && showText && "Link Copied!"}
        </>
      ) : (
        <>
          <Share2 className={cn("h-3.5 w-3.5", size === "icon" && "h-4 w-4")} />
          {size !== "icon" && showText && "Share"}
        </>
      )}
    </Button>
  )
}
