"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "@/lib/actions/auth"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-amber-500 dark:to-orange-500 text-white dark:text-neutral-950 font-semibold border-none shadow-md shadow-blue-500/30 dark:shadow-orange-500/20 hover:shadow-lg hover:shadow-blue-500/40 dark:hover:shadow-orange-500/30 transition-all hover:-translate-y-0.5" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Signing in...
        </>
      ) : (
        "Sign In"
      )}
    </Button>
  )
}

export default function LoginPage() {
  const [error, setError] = useState("")

  async function handleSubmit(formData: FormData) {
    setError("")
    const result = await signIn(formData)
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      window.location.href = "/"
    }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Welcome Back</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors">
          Sign in to your Eagle Choice account
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 transition-colors">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-amber-500/50 transition-all"
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 transition-colors">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-amber-500/50 transition-all"
            required
            autoComplete="current-password"
          />
        </div>

        <SubmitButton />
      </form>

      <div className="space-y-3 text-center text-sm">
        <Link
          href="/forgot-password"
          className="block text-blue-600 dark:text-amber-500 hover:text-blue-700 dark:hover:text-amber-400 transition-colors"
        >
          Forgot password?
        </Link>
        <p className="text-gray-500 dark:text-gray-400 transition-colors">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-600 dark:text-amber-500 hover:text-blue-700 dark:hover:text-amber-400 transition-colors"
          >
            Register
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-gray-400 dark:text-gray-600 pt-2 transition-colors">
        © {new Date().getFullYear()} Eagle Choice. All rights reserved.
      </p>
    </div>
  )
}
