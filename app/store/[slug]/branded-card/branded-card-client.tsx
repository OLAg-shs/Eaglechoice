"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, Share2, Loader2, RefreshCcw, Monitor, Settings, AtSign, Phone, ExternalLink, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import ChoiceCardPreview from "@/components/ChoiceCardPreview"
import Link from "next/link"

interface BrandedCardProps {
  store: any
  productCount: number
  agentCount: number
}

export default function BrandedCardClient({ store, productCount, agentCount }: BrandedCardProps) {
  const router = useRouter()
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

  const cardConfig = store.card_config || { theme: "midnight", layout: "landscape", primary_color: "#7c3aed" }
  const brandColor = store.brand_color || cardConfig.primary_color || "#7c3aed"
  const socialLinks = store.social_links || {}

  const storeUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/stores/${store.slug}`

  async function handleDownload() {
    setDownloading(true)
    setTimeout(() => {
      setDownloading(false)
      window.print()
    }, 1000)
  }

  async function handleShare() {
    const url = `${window.location.origin}/stores/${store.slug}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="space-y-10 max-w-4xl animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Boutique Identity.</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Your Choices, perfectly branded. Share your digital card anywhere.</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleShare}
            className="h-12 rounded-2xl font-bold px-6 gap-2 border-gray-200 dark:border-gray-800"
          >
            {copied ? <CheckCheck className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
            {copied ? "Copied!" : "Share Link"}
          </Button>
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="h-12 rounded-2xl font-black px-8 gap-2 text-white shadow-xl transition-all hover:opacity-90"
            style={{ background: brandColor }}
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download Card
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Card Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-50/50 dark:bg-white/5 p-10 rounded-[3.5rem] border border-gray-100 dark:border-white/10 shadow-inner flex items-center justify-center min-h-[420px]">
            <div className="w-full max-w-md">
              <ChoiceCardPreview
                name={store.name}
                tagline={store.tagline || ""}
                color={brandColor}
                theme={cardConfig.theme}
                layout={cardConfig.layout}
                socials={{
                  instagram: socialLinks.instagram,
                  facebook: socialLinks.facebook,
                }}
              />
            </div>
          </div>
          <div className="flex items-center justify-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
            <div className="flex items-center gap-2 italic"><RefreshCcw className="h-3 w-3" /> Auto-Synced</div>
            <div className="flex items-center gap-2 italic"><Monitor className="h-3 w-3" /> Digital Ready</div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="space-y-4">

          {/* Card Intelligence */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-[2rem] shadow-sm space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Card Intelligence</Label>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Live Theme</span>
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: brandColor }}>{cardConfig.theme}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Card Layout</span>
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: brandColor }}>{cardConfig.layout}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Brand Color</span>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border border-white shadow-sm" style={{ background: brandColor }} />
                  <span className="text-xs font-mono font-black text-gray-500 uppercase">{brandColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visibility Stats */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-[2rem] shadow-sm space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Visibility Stats</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
                <p className="text-2xl font-black text-gray-900 dark:text-white">{productCount}</p>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Products</p>
              </div>
              <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
                <p className="text-2xl font-black text-gray-900 dark:text-white">{agentCount}</p>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Team</p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          {(socialLinks.instagram || socialLinks.facebook || socialLinks.whatsapp || socialLinks.website) && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-[2rem] shadow-sm space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Connected Channels</Label>
              <div className="space-y-2">
                {socialLinks.instagram && (
                  <a href={`https://instagram.com/${socialLinks.instagram.replace("@", "")}`} target="_blank"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                    <AtSign className="h-4 w-4 text-pink-500" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 flex-1">{socialLinks.instagram}</span>
                    <ExternalLink className="h-3 w-3 text-gray-300" />
                  </a>
                )}
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook.startsWith("http") ? socialLinks.facebook : `https://facebook.com/${socialLinks.facebook}`} target="_blank"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                    <Share2 className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 flex-1">Facebook</span>
                    <ExternalLink className="h-3 w-3 text-gray-300" />
                  </a>
                )}
                {socialLinks.whatsapp && (
                  <a href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, "")}`} target="_blank"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                    <Phone className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 flex-1">{socialLinks.whatsapp}</span>
                    <ExternalLink className="h-3 w-3 text-gray-300" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Update Card Styling — links to settings */}
          <Link href={`/store/${store.slug}/settings`}>
            <Button
              variant="outline"
              className="w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] border-2 hover:shadow-md transition-all"
              style={{ borderColor: brandColor + "44", color: brandColor }}
            >
              <Settings className="h-4 w-4 mr-2" />
              Update Card Styling
            </Button>
          </Link>
        </div>
      </div>

      <p className="text-center text-[10px] text-gray-400 font-medium italic">
        This card is your official boutique digital asset. Updates in Settings are applied instantly.
      </p>
    </div>
  )
}
