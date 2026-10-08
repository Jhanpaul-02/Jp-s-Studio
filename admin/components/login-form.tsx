'use client'

import { type FormEvent, useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import './login-form.css'

type Theme = 'dark' | 'light'

const themeStorageKey = 'jp-studio-login-theme'
const themeChangeEvent = 'jp-studio-theme-change'

function subscribeToTheme(onChange: () => void) {
  window.addEventListener('storage', onChange)
  window.addEventListener(themeChangeEvent, onChange)

  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(themeChangeEvent, onChange)
  }
}

function getStoredTheme(): Theme {
  try {
    return window.localStorage.getItem(themeStorageKey) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

function getServerTheme(): Theme {
  return 'dark'
}

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const theme = useSyncExternalStore(subscribeToTheme, getStoredTheme, getServerTheme)

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'

    try {
      window.localStorage.setItem(themeStorageKey, nextTheme)
    } catch {
      return
    }

    window.dispatchEvent(new Event(themeChangeEvent))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
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

      router.replace('/dashboard')
    } catch {
      setErrorMessage('Could not reach Supabase. Check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page" data-theme={theme}>
      <section className="login-layout" aria-label="Jp's Studio member access">
        <div className="login-panel">
          <div className="login-panel-top">
            <p className="login-kicker">Jp&apos;s Studio / Member Access</p>
            <button
              type="button"
              className="theme-toggle"
              role="switch"
              aria-checked={theme === 'light'}
              aria-label="Light mode"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              onClick={toggleTheme}
            >
              <span className="theme-toggle-track" aria-hidden="true">
                <span className="theme-toggle-thumb" />
              </span>
              <span>{theme === 'light' ? 'Light' : 'Dark'}</span>
            </button>
          </div>

          <header className="login-header">
            <h1 id="login-title">
              <span>Welcome</span>
              <span className="login-title-outline">back.</span>
            </h1>
            <p>Good to see you again. Log in to your account.</p>
          </header>

          <form onSubmit={handleSubmit} className="login-form" aria-labelledby="login-title">
            <div className="login-field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <div className="login-password-control">
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button type="button" className="login-password-toggle" aria-label="Show password" disabled>
                  <span className="login-eye" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="login-forgot-row">
              <button type="button" className="login-inline-action" disabled>Forgot password?</button>
            </div>

            {errorMessage && <p role="alert" className="login-message login-message--error">{errorMessage}</p>}
            <button type="submit" disabled={isSubmitting} className="login-button">
              <span>{isSubmitting ? 'Logging in...' : 'Log in'}</span>
              <span className="login-button-arrow" aria-hidden="true">&rarr;</span>
            </button>

          </form>
        </div>

        <aside className="login-visual" role="img" aria-label="Monochrome line illustration of a person working at a laptop">
          <div className="login-visual-art">
            <Image
              src="/studio-login-illustration.svg"
              alt=""
              aria-hidden="true"
              width={430}
              height={400}
              unoptimized
              loading="eager"
              className="login-visual-art-image login-visual-art-image--dark"
            />
            <Image
              src="/studio-login-illustration-light.svg"
              alt=""
              aria-hidden="true"
              width={430}
              height={400}
              unoptimized
              loading="eager"
              className="login-visual-art-image login-visual-art-image--light"
            />
          </div>
          <div className="login-visual-caption" aria-hidden="true">
            <span>DESIGN. DEVELOP. CREATE.</span>
            <span>JP LACSAMANA</span>
          </div>
        </aside>
      </section>

      <footer className="login-footer">
        <div className="login-footer-brand">
          <Image
            src="/studio-logo.png"
            alt="Jp's Studio"
            width={36}
            height={36}
            className="login-footer-logo"
          />
          <span>&copy; 2026 Jp&apos;s Studio</span>
        </div>
        <span>Design with intention. Build with purpose.</span>
      </footer>
    </main>
  )
}