"use client"

import { useState } from "react"
import { UploadCloud, Loader2, CheckCircle2, FileCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { uploadPaymentProof } from "@/lib/actions/orders"

export function ReceiptUploader({ orderId, existingProofUrl }: { orderId: string; existingProofUrl?: string }) {
  const [uploading, setUploading] = useState(false)
  const [proofUrl, setProofUrl] = useState(existingProofUrl || "")
  const { toast } = useToast()

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.set("orderId", orderId)
    formData.set("proof", file)

    const result = await uploadPaymentProof(formData)
    setUploading(false)

    if (result.error) {
      toast({ variant: "destructive", title: "Upload Failed", description: result.error })
    } else if (result.url) {
      setProofUrl(result.url)
      toast({ title: "Receipt Uploaded ✅", description: "Your payment proof has been submitted. The agent will verify it shortly." })
    }
  }

  if (proofUrl) {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-green-700 dark:text-green-400 text-sm">Receipt Submitted</p>
          <p className="text-xs text-green-600 dark:text-green-500">Your agent will verify and confirm the payment.</p>
        </div>
        <a href={proofUrl} target="_blank" rel="noreferrer"
          className="text-xs text-green-700 dark:text-green-400 underline font-medium">
          View
        </a>
      </div>
    )
  }

  return (
    <div className="relative border-2 border-dashed border-orange-200 dark:border-orange-800 rounded-xl p-5 bg-orange-50/50 dark:bg-orange-900/10 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors group cursor-pointer">
      <input
        type="file"
        accept="image/*,.pdf"
        onChange={handleUpload}
        disabled={uploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="flex flex-col items-center text-center pointer-events-none">
        {uploading ? (
          <>
            <Loader2 className="h-8 w-8 text-orange-500 animate-spin mb-2" />
            <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">Uploading proof...</p>
          </>
        ) : (
          <>
            <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-3">
              <FileCheck className="h-6 w-6 text-orange-500" />
            </div>
            <p className="text-sm font-bold text-orange-700 dark:text-orange-400">Upload Payment Proof</p>
            <p className="text-xs text-orange-500 dark:text-orange-500 mt-1">Screenshot or PDF of your Paystack receipt (tap to select)</p>
          </>
        )}
      </div>
    </div>
  )
}
