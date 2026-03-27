"use client"

import { useState } from "react"
import { Share2, Check, Copy, MessageCircle, ExternalLink, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

interface ShareButtonProps {
  url: string
  title: string
  // Dynamic branding support
  id?: string
  price?: string
  type?: 'product' | 'service'
  image?: string
  specs?: string[]
  variant?: "outline" | "ghost" | "secondary" | "default" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showText?: boolean
}

export function ShareButton({ 
  url, 
  title, 
  id = "",
  price = "",
  type = "product",
  image = "",
  specs = [],
  variant = "outline", 
  size = "sm", 
  className,
  showText = true 
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  // Automatic Cache Buster: Add a timestamp to ensure fresh social crawls
  const getShareUrl = () => {
    const timestamp = Math.floor(Date.now() / 1000)
    const shareUrl = new URL(url)
    shareUrl.searchParams.set("v", timestamp.toString())
    return shareUrl.toString()
  }

  const shareTitle = `${title} — Eagle Choice`
  
  // High-conversion sales copy for WhatsApp/Socials
  const getShareText = () => {
    const action = type === 'product' ? 'Buy' : 'Get'
    return `Want to ${action} the new ${title}? 🦅\nDon't know where to find it? Look no further! 🚀\n\nAt Eagle Choice, we provide Verified and Authentic ${type === 'product' ? 'products' : 'services'} at affordable prices. ✅\n\nCheck it out on our website 👇\n`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl())
      setCopied(true)
      toast({
        title: "Link Copied",
        description: "Clean product link copied to clipboard.",
      })
      setTimeout(() => setCopied(false), 2500)
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Please copy the URL manually.",
      })
    }
  }

  const copySalesTextToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${getShareText()}${getShareUrl()}`)
      toast({
        title: "Sales Copy Copied",
        description: "Branded text and link ready to paste!",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Unable to copy sales text.",
      })
    }
  }

  const shareWhatsApp = () => {
    const finalUrl = getShareUrl()
    const encodedText = encodeURIComponent(getShareText() + finalUrl)
    window.open(`https://wa.me/?text=${encodedText}`, "_blank")
  }

  const shareTwitter = () => {
    const finalUrl = getShareUrl()
    const encodedText = encodeURIComponent(getShareText())
    const encodedUrl = encodeURIComponent(finalUrl)
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, "_blank")
  }

  const shareFacebook = () => {
    const finalUrl = getShareUrl()
    const encodedUrl = encodeURIComponent(finalUrl)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank")
  }

  const downloadBrandedCard = () => {
    const params = new URLSearchParams()
    
    if (id) {
      // Short URL version
      params.set("id", id)
      params.set("type", type)
    } else {
      // Legacy/Manual version
      params.set("title", title)
      params.set("price", price)
      params.set("type", type)
      params.set("image", image)
      specs.forEach((spec, i) => {
        params.set(`s${i+1}`, spec)
      })
    }
    
    params.set("download", "1")
    window.open(`/api/og?${params.toString()}`, "_blank")
    
    toast({
      title: "Generating Card",
      description: "Preparing your branded asset for download.",
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            variant === "outline" && "border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20",
            size !== "icon" && "gap-2 text-xs font-semibold",
            "transition-all",
            className
          )}
        >
          {copied ? (
            <Check className={cn("h-3.5 w-3.5 text-green-500", size === "icon" && "h-4 w-4")} />
          ) : (
            <Share2 className={cn("h-3.5 w-3.5", size === "icon" && "h-4 w-4")} />
          )}
          {size !== "icon" && showText && (copied ? "Copied!" : "Share")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-sm border-gray-200 dark:border-gray-800">
        <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-gray-500">Share Product</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={shareWhatsApp} className="cursor-pointer gap-3 py-2.5 focus:bg-green-500/10 focus:text-green-600 dark:focus:text-green-400">
          <MessageCircle className="h-4 w-4 text-green-500" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">WhatsApp</span>
            <span className="text-[10px] text-gray-500">Best for private chats</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareFacebook} className="cursor-pointer gap-3 py-2.5 focus:bg-blue-600/10 focus:text-blue-600 dark:focus:text-blue-400">
          <ExternalLink className="h-4 w-4 text-blue-600" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Facebook</span>
            <span className="text-[10px] text-gray-500">Post to your feed</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareTwitter} className="cursor-pointer gap-3 py-2.5 focus:bg-sky-500/10 focus:text-sky-500 dark:focus:text-sky-400">
          <ExternalLink className="h-4 w-4 text-sky-500" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Twitter (X)</span>
            <span className="text-[10px] text-gray-500">Share with followers</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={downloadBrandedCard} className="cursor-pointer gap-3 py-2.5 focus:bg-amber-500/10 focus:text-amber-600 dark:focus:text-amber-400">
          <Download className="h-4 w-4 text-amber-500" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Download Card</span>
            <span className="text-[10px] text-gray-500">High-res branded asset</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer gap-3 py-2.5 focus:bg-amber-500/10 focus:text-amber-600 dark:focus:text-amber-400">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-amber-500" />}
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{copied ? "Copied!" : "Copy Link"}</span>
            <span className="text-[10px] text-gray-500">Clean product link</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={copySalesTextToClipboard} className="cursor-pointer gap-3 py-2.5 focus:bg-amber-500/10 focus:text-amber-600 dark:focus:text-amber-400">
          <ExternalLink className="h-4 w-4 text-amber-500" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Copy Sales Text</span>
            <span className="text-[10px] text-gray-500">Branded ad + link</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
