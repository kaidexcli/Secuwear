"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const router = useRouter()
  
  // UI States
  const [loginType, setLoginType] = useState<'user' | 'dispatch'>('user')
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  
  // Form States
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Force 'signin' mode if they switch to Dispatch (Authorities cannot self-register)
  useEffect(() => {
    if (loginType === 'dispatch') {
      setAuthMode('signin')
    }
  }, [loginType])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (authMode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (signUpError) throw signUpError

        // Prevent silent duplicate registrations
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          throw new Error("An account with this email already exists.")
        }

        setSuccess("Registration successful! Please check your email to verify your account.")
        setAuthMode('signin')
        setPassword('')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError

        // Force Next.js to update and run the proxy.ts middleware
        router.refresh()
        
        if (loginType === 'dispatch') {
          router.push('/dispatch')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (err: any) {
      console.error("Full authentication error:", err) // Logs raw error to browser console
      
      // Robust error parsing to prevent '{}' UI renders
      let errorMessage = "An unexpected error occurred during authentication."
      
      if (err?.message && err.message !== '{}') {
        errorMessage = err.message
      } else if (err?.error_description) {
        errorMessage = err.error_description
      } else if (typeof err === 'string' && err !== '{}') {
        errorMessage = err
      } else if (typeof err === 'object' && Object.keys(err).length === 0) {
        errorMessage = "Network or Database error. Please check the browser console for details."
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-black overflow-hidden px-4 text-white font-sans">
      
      {/* 3D Cinematic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Technical Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:32px_32px] opacity-40"></div>
        
        {/* Animated Glowing Orbs */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-zinc-800/40 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.5, 1], 
            opacity: [0.2, 0.4, 0.2],
            y: [0, -50, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className={`absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] blur-[120px] rounded-full transition-colors duration-1000 ${
            loginType === 'dispatch' ? 'bg-red-900/40' : 'bg-zinc-700/40'
          }`}
        />
      </div>

      {/* Main Glassmorphism Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
        className="relative w-full max-w-md bg-zinc-950/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-[0_0_40px_-10px_rgba(0,0,0,0.7)] z-10"
      >
        
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 layout className="text-3xl font-bold tracking-tight text-white">
            SecuWear
          </motion.h1>
          <motion.p layout className="text-zinc-400 mt-2 text-sm">
            {loginType === 'user' 
              ? (authMode === 'signin' ? 'Access your personal safety portal.' : 'Register your new SecuWear device.')
              : 'Enter the emergency response dispatch hub.'}
          </motion.p>
        </div>

        {/* Portal Toggle Tabs */}
        <div className="flex p-1.5 bg-black/50 border border-white/5 rounded-xl mb-8 relative z-20">
          <button
            onClick={() => setLoginType('user')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
              loginType === 'user'
                ? 'bg-zinc-800 text-white shadow-md'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            User Portal
          </button>
          <button
            onClick={() => setLoginType('dispatch')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
              loginType === 'dispatch'
                ? 'bg-red-900/60 text-red-50 shadow-md border border-red-500/20'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Dispatch
          </button>
        </div>

        {/* Alerts (Error / Success) */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm text-center"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="space-y-5 relative z-20">
          <motion.div layout>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5 pl-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all text-white placeholder:text-zinc-600"
              placeholder="operator@secuwear.com"
            />
          </motion.div>

          <motion.div layout>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5 pl-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-5 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all text-white placeholder:text-zinc-600"
              placeholder="••••••••"
            />
          </motion.div>

          <motion.button
            layout
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 mt-6 rounded-xl font-semibold transition-all duration-300 ${
              loading 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                : loginType === 'dispatch'
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_-5px_rgba(220,38,38,0.5)]'
                  : 'bg-white hover:bg-zinc-200 text-black shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]'
            }`}
          >
            {loading 
              ? 'Authenticating...' 
              : authMode === 'signin' ? 'Sign In' : 'Create Account'}
          </motion.button>
        </form>

        {/* Footer Toggle (Only show for User Portal) */}
        {loginType === 'user' && (
          <motion.div layout className="mt-8 text-center">
            <p className="text-zinc-500 text-sm">
              {authMode === 'signin' ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'signin' ? 'signup' : 'signin')
                  setError(null)
                  setSuccess(null)
                }}
                className="text-white hover:text-zinc-300 font-medium transition-colors"
              >
                {authMode === 'signin' ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </motion.div>
        )}
        
        {/* Dispatch restriction note */}
        {loginType === 'dispatch' && (
          <motion.div layout className="mt-8 text-center">
            <p className="text-zinc-600 text-xs px-4">
              Authority accounts must be provisioned by a system administrator. Self-registration is disabled.
            </p>
          </motion.div>
        )}

      </motion.div>
    </div>
  )
}
