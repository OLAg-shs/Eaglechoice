"use client"

import { useState } from "react"
import { ShieldCheck, MessageSquare, Send, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface InquiryModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: string
    name: string
    price?: number
  }
  agent: {
    id: string
    name: string
    is_verified?: boolean
  }
  allowNegotiation?: boolean
}

export function InquiryModal({ isOpen, onClose, product, agent, allowNegotiation }: InquiryModalProps) {
  const [message, setMessage] = useState(`Hello ${agent.name.split(' ')[0]}, I'm interested in the ${product.name}. Is it still available?`)
  const [isNegotiating, setIsNegotiating] = useState(false)
  const [offerPrice, setOfferPrice] = useState(product.price?.toString() || "")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSend() {
    setLoading(true)
    // Simulate API call to create negotiation or message
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setSent(true)
    setTimeout(() => {
      onClose()
      setSent(false)
    }, 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] rounded-[2rem] p-0 overflow-hidden border-none shadow-[0_30px_90px_rgba(0,0,0,0.2)] dark:bg-gray-950 font-sans">
        
        {/* Header with Agent Info */}
        <div className="bg-gray-50 dark:bg-gray-900/50 p-8 border-b border-gray-100 dark:border-gray-800">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-500/20">
                {agent.name[0]}
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                  Talk to {agent.name.split(' ')[0]}
                  {agent.is_verified && <ShieldCheck className="h-4 w-4 text-blue-500" />}
                </DialogTitle>
                <DialogDescription className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  Verified Store Agent
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 inline-block px-3 py-1 rounded-full font-black uppercase tracking-tighter">
                {product.name}
              </p>
              {allowNegotiation && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Open to Offers
                </div>
              )}
            </div>
          </DialogHeader>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
          {sent ? (
            <div className="text-center py-10 space-y-4 animate-in zoom-in-95 duration-500">
              <div className="h-20 w-20 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto text-green-500 shadow-inner">
                <Send className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                  {isNegotiating ? "Offer Submitted!" : "Inquiry Sent!"}
                </h3>
                <p className="text-sm text-gray-500 italic">Agent {agent.name.split(' ')[0]} will respond shortly.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Negotiation Toggle */}
              {allowNegotiation && (
                <div className="flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-xs font-black text-gray-900 dark:text-white tracking-tight">Price Negotiation</p>
                    <p className="text-[10px] text-gray-400 font-medium">Would you like to make a special offer?</p>
                  </div>
                  <Switch 
                    checked={isNegotiating} 
                    onCheckedChange={setIsNegotiating}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
              )}

              {isNegotiating ? (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Your Price Offer (GHS)</Label>
                    <div className="relative">
                      <Input 
                        type="number"
                        value={offerPrice}
                        onChange={e => setOfferPrice(e.target.value)}
                        className="h-16 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-2xl font-black pl-4"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 transition-all">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Your Message</Label>
                  <Textarea 
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="min-h-[120px] rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-sm leading-relaxed"
                    placeholder="Ask about availability, delivery..."
                  />
                </div>
              )}

              <Button 
                onClick={handleSend}
                disabled={loading || (isNegotiating ? !offerPrice : !message.trim())}
                className={`w-full h-16 rounded-2xl font-black text-white shadow-xl transition-all text-lg group ${isNegotiating ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}`}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : (
                  <>
                    {isNegotiating ? "Submit My Offer" : "Send Inquiry"} 
                    <Send className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="px-8 pb-8 text-center">
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">Secure Marketplace Negotiation &bull; Eagle Choice</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
