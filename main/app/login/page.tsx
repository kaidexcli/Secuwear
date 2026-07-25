"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginPage() {
  const router = useRouter()
  // State to toggle between User and Dispatch interfaces
  const [loginType, setLoginType] = useState<'user' | 'dispatch'>('user')
  
  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Initialize Supabase browser client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Attempt Supabase login
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // CRITICAL: Force Next.js to update so your proxy.ts detects the new cookies
    router.refresh()
    
    // Route to the appropriate dashboard
    if (loginType === 'dispatch') {
      router.push('/dispatch')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white px-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">SecuWear</h1>
          <p className="text-zinc-400 mt-2 text-sm">
            {loginType === 'user' 
              ? 'Access your personal safety portal.' 
              : 'Enter the emergency response dispatch hub.'}
          </p>
        </div>

        {/* Portal Toggle Tabs */}
        <div className="flex p-1 bg-zinc-950 rounded-lg mb-8">
          <button
            onClick={() => setLoginType('user')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              loginType === 'user'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            User Portal
          </button>
          <button
            onClick={() => setLoginType('dispatch')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              loginType === 'dispatch'
                ? 'bg-red-900/50 text-red-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Dispatch Login
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-colors"
              placeholder="operator@secuwear.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 mt-4 rounded-lg font-medium transition-colors ${
              loading 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                : loginType === 'dispatch'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-white hover:bg-zinc-200 text-black'
            }`}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  )
}
