"use client"

import { useState } from "react"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateAdminProfile } from "@/lib/actions/auth"
import { useToast } from "@/components/ui/use-toast"

export function AdminProfileForm({ initialName, initialEmail }: { initialName: string, initialEmail: string }) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append("full_name", name)
    formData.append("email", email)

    const result = await updateAdminProfile(formData)
    
    setLoading(false)
    if (result.error) {
      toast({ variant: "destructive", title: "Update Failed", description: result.error })
    } else if (result.success) {
      toast({ title: "Success", description: result.message })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input 
            id="full_name" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>
      <p className="text-xs text-amber-600 font-medium">
        Note: For security, if you change your email, Supabase will send a verification link to your new address. You must click it before the email actually changes in the system.
      </p>

      <div className="flex items-center gap-4 pt-2">
        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Update Profile</>}
        </Button>
      </div>
    </form>
  )
}
