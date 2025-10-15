'use client'

import { darkTheme } from '@/styles/darkTheme'
import React, { useState } from 'react'

interface AuthModalProps {
  onAuthenticated: (key: string) => void
  onClose: () => void
}

export function AuthModal({ onAuthenticated, onClose }: AuthModalProps) {
  const [adminKey, setAdminKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!adminKey) {
      setError('Please enter the Admin Key.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey,
        },
        body: JSON.stringify({ action: 'verify' }),
      })

      if (response.ok) {
        onAuthenticated(adminKey)
      } else {
        setError('Invalid Admin Key. Access denied.')
      }
    } catch (err) {
      console.error(err)
      setError('Network error or server unavailable.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={`fixed inset-0 ${darkTheme.colors.background} flex items-center justify-center p-4 z-[100]`}
    >
      <div
        className={`${darkTheme.colors.card} ${darkTheme.spacing.modalPadding} ${darkTheme.rounded} ${darkTheme.shadow} w-full max-w-sm`}
      >
        <h3
          className={`text-xl font-bold mb-4 text-center ${darkTheme.colors.heading}`}
        >
          🔐 Admin Panel Access
        </h3>

        {error && (
          <div
            className={`${darkTheme.colors.errorBg} border-l-4 ${darkTheme.colors.errorBorder} ${darkTheme.colors.errorText} p-3 mb-4 ${darkTheme.rounded} text-sm`}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="key"
              className={`block text-sm font-medium mb-1 ${darkTheme.colors.label}`}
            >
              Master Admin Key
            </label>
            <input
              id="key"
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className={`w-full p-2 border ${darkTheme.colors.inputText} ${darkTheme.colors.inputBorder} ${darkTheme.colors.inputBg} ${darkTheme.colors.inputFocusRing} ${darkTheme.rounded}`}
              disabled={isLoading}
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-sm font-medium ${darkTheme.colors.buttonSecondary} ${darkTheme.rounded} transition duration-150`}
              disabled={isLoading}
            >
              Close
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-sm font-medium ${darkTheme.colors.buttonPrimary} ${darkTheme.rounded} disabled:opacity-50 transition duration-150`}
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Authenticate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
