'use client'

import { darkTheme } from '@/styles/darkTheme'
import React, { useState } from 'react'

interface DeleteProjectModalProps {
  projectKey: string
  onClose: () => void
  onDeleteSuccess: (deletedKey: string) => void
}

export const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  projectKey,
  onClose,
  onDeleteSuccess,
}) => {
  const [adminKey, setAdminKey] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [authMessage, setAuthMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleVerifyKey = async () => {
    if (!adminKey.trim()) {
      setAuthMessage('Please enter the Admin Key.')
      return
    }
    setVerifying(true)
    setAuthMessage(null)
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
        setIsAuthorized(true)
        setAuthMessage('Authorized ✅')
      } else {
        setIsAuthorized(false)
        setAuthMessage('Unauthorized ❌')
      }
    } catch {
      setIsAuthorized(false)
      setAuthMessage('Network error or server unavailable.')
    } finally {
      setVerifying(false)
    }
  }

  const handleDelete = async () => {
    if (!isAuthorized) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/projects?key=${projectKey}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey,
        },
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete project.')
      }

      onDeleteSuccess(projectKey)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Unexpected server error.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={`fixed inset-0 ${darkTheme.colors.modalOverlay} flex items-center justify-center p-4 z-50`}
    >
      <div
        className={`${darkTheme.colors.card} ${darkTheme.spacing.modalPadding} ${darkTheme.rounded} ${darkTheme.shadow} max-w-sm w-full transform transition-all scale-100 ease-out duration-300`}
      >
        <h3 className={`${darkTheme.colors.heading} text-xl font-bold mb-4`}>
          ⚠️ Confirm Deletion
        </h3>

        <p className={`${darkTheme.colors.text} mb-6`}>
          Are you sure you want to delete the project:
          <span className="font-mono bg-gray-700 text-gray-100 px-2 py-0.5 rounded ml-1">
            {projectKey}
          </span>
          ? This action is{' '}
          <span className={darkTheme.colors.errorText}>irreversible</span>.
        </p>

        {/* Admin Key Verification */}
        {!isAuthorized && (
          <div className="mb-4">
            <label
              className={`block text-sm font-medium ${darkTheme.colors.label} mb-1`}
            >
              Admin Key
            </label>
            <div
              className={`flex flex-col md:flex-row ${darkTheme.spacing.gap}`}
            >
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter Admin Key"
                className={`flex-1 ${darkTheme.input} ${darkTheme.colors.inputText} ${darkTheme.colors.inputBg} border ${darkTheme.colors.inputBorder} ${darkTheme.colors.inputFocusRing}`}
                disabled={verifying}
              />
              <button
                type="button"
                onClick={handleVerifyKey}
                className={`w-full md:w-auto px-3 py-2 ${darkTheme.colors.buttonDanger} ${darkTheme.rounded} transition-colors`}
                disabled={verifying || !adminKey.trim()}
              >
                {verifying ? 'Verifying...' : 'Verify'}
              </button>
            </div>
            {authMessage && (
              <p
                className={`mt-2 font-medium ${
                  isAuthorized
                    ? darkTheme.colors.successText
                    : darkTheme.colors.errorText
                }`}
              >
                {authMessage}
              </p>
            )}
          </div>
        )}

        {error && (
          <p className={`${darkTheme.colors.errorText} mb-4 font-medium`}>
            {error}
          </p>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium ${darkTheme.colors.text} bg-gray-700 rounded-md hover:bg-gray-600 transition duration-150 cursor-pointer`}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className={`px-4 py-2 text-sm font-medium ${darkTheme.colors.buttonDanger} ${darkTheme.rounded} disabled:opacity-50 transition duration-150 cursor-pointer`}
            disabled={!isAuthorized || isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
