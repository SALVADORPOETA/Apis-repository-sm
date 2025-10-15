'use client'

import React, { useState } from 'react'
import { IProject } from '@/lib/project-utils'
import { darkTheme } from '@/styles/darkTheme'

interface CreateProjectFormProps {
  onCreateSuccess: (newProject: IProject) => void
  onClose: () => void
  isLoading?: boolean
  isAdminValidated: boolean
  onValidated?: () => void
}

export const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
  onCreateSuccess,
  onClose,
  isLoading = false,
  isAdminValidated,
  onValidated,
}) => {
  const [adminKey, setAdminKey] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authMessage, setAuthMessage] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)

  const [name, setName] = useState('')
  const [key, setKey] = useState('')
  const [sectionsInput, setSectionsInput] = useState('home, about')
  const [error, setError] = useState<string | null>(null)

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, '')
      .trim()

  const handleVerifyKey = async () => {
    if (!adminKey) {
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
        onValidated?.()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthorized) {
      setError('You must verify the Admin Key before creating a project.')
      return
    }
    setError(null)

    const sanitizedKey = slugify(key || name)
    const sanitizedSections = sectionsInput
      .split(',')
      .map((s) => slugify(s))
      .filter((s) => s.length > 0)

    if (!name.trim() || !sanitizedKey) {
      setError('Project Name and Key are required.')
      return
    }
    if (sanitizedSections.length === 0) {
      setError('You must enter at least one section (e.g., home).')
      return
    }

    const projectData: Omit<IProject, 'key'> & { key: string } = {
      key: sanitizedKey,
      name: name.trim(),
      sections: sanitizedSections,
    }

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey,
        },
        body: JSON.stringify(projectData),
      })
      const result = await response.json()
      if (!response.ok)
        throw new Error(result.message || 'Error creating project.')

      onCreateSuccess(result.project)
      setName('')
      setKey('')
      setSectionsInput('home, about')
      setIsAuthorized(false)
      setAdminKey('')
      setAuthMessage(null)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Unexpected server error.')
    }
  }

  return (
    <div
      className={`fixed inset-0 ${darkTheme.colors.background} flex items-center justify-center p-4 z-50`}
    >
      <div
        className={`${darkTheme.colors.card} ${darkTheme.spacing.modalPadding} ${darkTheme.rounded} ${darkTheme.shadow} w-full max-w-lg transform transition-all scale-100 ease-out duration-300 max-h-[90vh] overflow-y-auto ${darkTheme.colors.text}`}
      >
        <h3
          className={`text-2xl font-bold mb-4 border-b pb-2 ${darkTheme.colors.heading}`}
        >
          ➕ Create New Project
        </h3>

        {/* Admin Key Verification */}
        <div className="mb-4">
          <label
            className={`block text-sm font-medium mb-1 ${darkTheme.colors.label}`}
          >
            Admin Key
          </label>
          <div className={`flex ${darkTheme.spacing.gap}`}>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className={`flex-1 p-3 border rounded-lg ${darkTheme.colors.inputBg} ${darkTheme.colors.inputText} ${darkTheme.colors.inputBorder} ${darkTheme.colors.inputFocusRing}`}
              placeholder="Enter Admin Key"
              disabled={verifying || isAuthorized || isLoading}
            />
            <button
              type="button"
              onClick={handleVerifyKey}
              className={`px-4 py-2 font-semibold ${darkTheme.colors.buttonPrimary} ${darkTheme.rounded} transition-colors cursor-pointer`}
              disabled={verifying || isAuthorized || isLoading}
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

        {/* Error */}
        {error && (
          <div
            className={`${darkTheme.colors.errorBg} ${darkTheme.colors.errorText} ${darkTheme.colors.errorBorder} border-l-4 p-3 mb-4 rounded font-medium`}
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className={darkTheme.spacing.gap}>
          <div>
            <label
              className={`block text-sm font-medium ${darkTheme.colors.label}`}
            >
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${darkTheme.colors.inputBg} ${darkTheme.colors.inputText} ${darkTheme.colors.inputBorder} ${darkTheme.colors.inputFocusRing}`}
              placeholder="e.g., Mayan Culture Project"
              disabled={isLoading || !isAuthorized}
              required
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium ${darkTheme.colors.label} pt-4`}
            >
              Key/Slug (Unique, for URL)
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${darkTheme.colors.inputBg} ${darkTheme.colors.inputText} ${darkTheme.colors.inputBorder} ${darkTheme.colors.inputFocusRing}`}
              placeholder={`Suggestion: ${slugify(name) || 'mayan_project'}`}
              disabled={isLoading || !isAuthorized}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium ${darkTheme.colors.label} pt-4`}
            >
              Sections (comma-separated)
            </label>
            <textarea
              value={sectionsInput}
              onChange={(e) => setSectionsInput(e.target.value)}
              rows={3}
              className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${darkTheme.colors.inputBg} ${darkTheme.colors.inputText} ${darkTheme.colors.inputBorder} ${darkTheme.colors.inputFocusRing}`}
              placeholder="e.g., home, history, cities, gallery"
              disabled={isLoading || !isAuthorized}
              required
            />
          </div>

          <div
            className={`flex justify-end space-x-3 pt-4 border-t border-gray-700`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-sm font-medium ${darkTheme.colors.buttonSecondary} ${darkTheme.rounded} transition duration-150 cursor-pointer`}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isAdminValidated || isLoading}
              className={`px-4 py-2 text-sm font-medium ${darkTheme.colors.buttonPrimary} ${darkTheme.rounded} disabled:opacity-50 transition duration-150`}
            >
              {isLoading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
