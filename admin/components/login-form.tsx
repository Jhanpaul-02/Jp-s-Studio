'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setErrorMessage(error.message)
        return
      }

      setSuccessMessage('Signed in successfully.')
    } catch {
      setErrorMessage('Could not reach Supabase. Check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-12 text-neutral-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 rounded-lg border border-neutral-800 bg-neutral-900 p-8"
      >
        <div>
          <p className="text-sm text-neutral-400">Jp's Studio</p>
          <h1 className="mt-2 text-2xl font-semibold">Admin sign in</h1>
        </div>

        <label className="block space-y-2 text-sm">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2"
          />
        </label>

        <label className="block space-y-2 text-sm">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2"
          />
        </label>

        {errorMessage && <p role="alert" className="text-sm text-red-400">{errorMessage}</p>}
        {successMessage && <p role="status" className="text-sm text-green-400">{successMessage}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-white px-4 py-2 font-medium text-neutral-950 disabled:opacity-50"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}