"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createAgentByAdmin } from "@/lib/actions/auth"

export default function NewAgentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const result = await createAgentByAdmin(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push("/admin/agents")
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/admin/agents" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4" />Back to Agents
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Agent</h1>
        <p className="text-sm text-gray-500 mt-1">Provision a new account for an Agent to log into.</p>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Agent Full Name</Label>
          <Input id="full_name" name="full_name" placeholder="Kwame Mensah" required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="agent@eaglechoice.com" required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number (Optional)</Label>
          <Input id="phone" name="phone" type="tel" placeholder="+233XXXXXXXXX" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Temporary Password</Label>
          <Input id="password" name="password" type="password" placeholder="At least 8 characters" required minLength={8} />
          <p className="text-xs text-gray-500">Provide this to the Agent so they can log in.</p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Agent"}
          </Button>
          <Link href="/admin/agents">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
