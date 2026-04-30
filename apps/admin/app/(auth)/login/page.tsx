"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { EyeIcon, Key01Icon, Mail01Icon, ViewOffIcon } from "hugeicons-react"
import { Button, Card, Input } from "@usesendnow/ui"
import { adminApi, AdminApiError } from "@/lib/admin-api"
import { setAdminToken } from "@/lib/admin-auth"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await adminApi.auth.login(email, password)
      setAdminToken(data.token)
      router.push("/overview")
    } catch (err) {
      if (err instanceof AdminApiError && err.code === "UNAUTHORIZED") {
        setError("Invalid credentials.")
      } else if (err instanceof AdminApiError && err.code === "ADMIN_SUSPENDED") {
        setError("Suspended admin account.")
      } else {
        setError("Login failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-subtle px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-xl font-black uppercase tracking-[0.06em] text-text">Admin Login</h1>
        <p className="mt-1 text-sm text-text-secondary">Dedicated internal authentication flow.</p>
        <form className="mt-5 space-y-4" onSubmit={submit}>
          <div className="space-y-1.5">
            <label className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">
              <Mail01Icon className="h-4 w-4" />
              Email
            </label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@company.com" />
          </div>
          <div className="space-y-1.5">
            <label className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">
              <Key01Icon className="h-4 w-4" />
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <ViewOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <Button type="submit" loading={loading} className="w-full justify-center">
            Sign in
          </Button>
        </form>
      </Card>
    </div>
  )
}
