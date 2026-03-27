"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPassword } from "@/lib/actions/auth"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Sending...</> : "Send Reset Link"}
    </Button>
  )
}

export default function ForgotPasswordPage() {
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError("")
    const result = await resetPassword(formData)
    if (result?.error) setError(result.error)
    else setSent(true)
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
        <h2 className="text-xl font-bold text-gray-900">Check your email</h2>
        <p className="text-sm text-gray-500">We sent a password reset link to your email address.</p>
        <Link href="/login" className="block text-sm font-medium text-blue-600 hover:underline">Back to Sign In</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
        <p className="mt-1 text-sm text-gray-500">Enter your email to receive a reset link</p>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500">{error}</div>}

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>
        <SubmitButton />
      </form>

      <Link href="/login" className="block text-center text-sm font-medium text-blue-600 hover:underline">
        Back to Sign In
      </Link>
    </div>
  )
}
