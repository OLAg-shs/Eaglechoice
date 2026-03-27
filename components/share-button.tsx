"use client"

import { useState } from "react"
import { Share2, Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ShareButton({ url, title }: { url: string; title: string }) {
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
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="gap-2 text-xs font-semibold border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-green-500" />
          Link Copied!
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5" />
          Share
        </>
      )}
    </Button>
  )
}
