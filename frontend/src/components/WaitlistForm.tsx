import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import type { SolutionType } from '@/lib/solutionTypes'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmail(email: string): boolean {
  return emailRegex.test(email)
}

function incrementLocalCount(solutionTypeId: string) {
  const key = `waitlist_${solutionTypeId}_count`
  const current = parseInt(localStorage.getItem(key) || '0', 10)
  localStorage.setItem(key, (current + 1).toString())
}

interface WaitlistFormProps {
  solutionType: SolutionType
}

export function WaitlistForm({ solutionType }: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [focused, setFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const endpoint = import.meta.env.VITE_WAITLIST_ENDPOINT as string | undefined

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidEmail(email)) {
      setValidationError('Invalid email. Please try again.')
      return
    }
    setValidationError(null)
    setError(null)
    setLoading(true)

    try {
      if (endpoint) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            email,
            solutionTypeId: solutionType.id,
            solutionTypeLabel: solutionType.label,
            timestamp: new Date().toISOString(),
            playgroundUrl: 'https://vibemodel.ai/playground',
          }),
        })

        if (!res.ok) {
          throw new Error(`Response ${res.status}`)
        }
      } else {
        // Fallback: no endpoint configured — open beta page
        setTimeout(() => {
          window.open(
            `https://vibemodel.ai/#beta-signup?interest=${solutionType.id}`,
            '_blank',
            'noopener,noreferrer',
          )
        }, 1200)
      }

      incrementLocalCount(solutionType.id)
      setSuccess(true)
    } catch (err) {
      const isOffline = !navigator.onLine
      setError(
        isOffline
          ? 'No internet connection. Please try again when online.'
          : `Something went wrong. Please try again or sign up at vibemodel.ai/#beta-signup`,
      )
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (validationError) setValidationError(null)
  }

  const borderColor = validationError
    ? '#ef4444'
    : focused
    ? solutionType.color
    : '#e5e7eb'

  return (
    <div
      className="max-w-md mx-auto mt-8 px-6 py-6 rounded-xl"
      style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
    >
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-3 text-center py-2"
          >
            <CheckCircle2 className="w-8 h-8" style={{ color: solutionType.color }} />
            <p className="text-sm font-semibold text-gray-800">
              You're on the list for {solutionType.label}.
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              We'll email you when it's ready. Check your spam folder just in case.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            noValidate
          >
            <label
              htmlFor={`waitlist-email-${solutionType.id}`}
              className="block text-xs font-semibold text-gray-700 mb-2"
            >
              Get notified when {solutionType.label} launches
            </label>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id={`waitlist-email-${solutionType.id}`}
                type="email"
                value={email}
                onChange={handleEmailChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="your@email.com"
                disabled={loading}
                required
                className="flex-1 rounded-lg px-4 py-2.5 text-sm outline-none transition-all disabled:opacity-60"
                style={{
                  border: `1.5px solid ${borderColor}`,
                  boxShadow: focused ? `0 0 0 3px ${solutionType.color}18` : 'none',
                }}
                aria-describedby={
                  validationError
                    ? `waitlist-error-${solutionType.id}`
                    : error
                    ? `waitlist-submit-error-${solutionType.id}`
                    : undefined
                }
              />

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.03 } : undefined}
                whileTap={!loading ? { scale: 0.97 } : undefined}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold shrink-0 disabled:opacity-70 disabled:cursor-not-allowed transition-opacity"
                style={{
                  background: loading
                    ? '#9ca3af'
                    : `linear-gradient(135deg, ${solutionType.color}, ${solutionType.color}cc)`,
                  boxShadow: loading ? 'none' : `0 2px 8px ${solutionType.color}35`,
                  minHeight: 44,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Notify Me</span>
                )}
              </motion.button>
            </div>

            {/* Validation error */}
            {validationError && (
              <p
                id={`waitlist-error-${solutionType.id}`}
                className="flex items-center gap-1.5 text-xs text-red-500 mt-2"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {validationError}
              </p>
            )}

            {/* Submit error */}
            {error && (
              <p
                id={`waitlist-submit-error-${solutionType.id}`}
                className="text-xs text-red-500 mt-2 leading-relaxed"
              >
                {error}
              </p>
            )}

            {/* Privacy note */}
            {!validationError && !error && (
              <p className="text-xs text-gray-400 mt-2.5 text-center leading-relaxed">
                We'll only email you about {solutionType.label} launches. No spam.
              </p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
