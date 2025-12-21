'use client'

import React, { useState } from 'react'
import { IProject } from '@/lib/project-utils'
import { darkTheme } from '@/styles/darkTheme'

interface EditProjectFormProps {
  project: IProject
  onSave: (updatedProject: IProject) => void
  onClose: () => void
  isAdminValidated: boolean
  onValidated?: () => void
}

export const EditProjectForm: React.FC<EditProjectFormProps> = ({
  project,
  onSave,
  onClose,
  isAdminValidated,
  onValidated,
}) => {
  const [adminKey, setAdminKey] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authMessage, setAuthMessage] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)

  const [name, setName] = useState(project.name)
  const [sectionsInput, setSectionsInput] = useState(
    project.sections.join(', ')
  )
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
      setError('You must verify the Admin Key before saving changes.')
      return
    }
    setError(null)
    setIsLoading(true)

    const sanitizedSections = sectionsInput
      .split(',')
      .map((s) => slugify(s))
      .filter((s) => s.length > 0)

    if (!name.trim()) {
      setError('Project Name is required.')
      setIsLoading(false)
      return
    }
    if (sanitizedSections.length === 0) {
      setError('You must enter at least one section.')
      setIsLoading(false)
      return
    }

    const projectUpdates: Partial<IProject> = {
      name: name.trim(),
      sections: sanitizedSections,
    }

    try {
      const response = await fetch(`/api/projects?key=${project.key}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey,
        },
        body: JSON.stringify(projectUpdates),
      })
      const result = await response.json()
      if (!response.ok)
        throw new Error(result.message || 'Error updating project.')

      onSave({ ...project, ...projectUpdates })
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Unexpected server error.')
    } finally {
      setIsLoading(false)
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
          ✏️ Edit Project
        </h3>

        {/* Admin Key Verification */}
        <div className="mb-4">
          <label
            className={`block text-sm font-medium mb-1 ${darkTheme.colors.label}`}
          >
            Admin Key
          </label>
          <div className={`flex flex-col md:flex-row ${darkTheme.spacing.gap}`}>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className={`flex-1 p-3 border ${darkTheme.rounded} ${darkTheme.colors.inputText} ${darkTheme.colors.inputBorder} ${darkTheme.colors.inputBg} ${darkTheme.colors.inputFocusRing}`}
              placeholder="Enter Admin Key"
              disabled={verifying || isAuthorized || isLoading}
            />
            <button
              type="button"
              onClick={handleVerifyKey}
              className={`px-4 py-2 font-semibold ${darkTheme.colors.buttonPrimary} ${darkTheme.rounded}`}
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
            className={`border-l-4 p-3 mb-4 ${darkTheme.rounded} ${darkTheme.colors.errorBg} ${darkTheme.colors.errorBorder} ${darkTheme.colors.errorText}`}
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className={`mt-1 block w-full border ${darkTheme.colors.inputText} ${darkTheme.colors.inputBorder} ${darkTheme.input} ${darkTheme.colors.inputBg} ${darkTheme.colors.inputFocusRing}`}
              placeholder="e.g., Mayan Culture Project"
              disabled={isLoading || !isAuthorized}
              required
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium ${darkTheme.colors.label}`}
            >
              Sections (comma-separated)
            </label>
            <textarea
              value={sectionsInput}
              onChange={(e) => setSectionsInput(e.target.value)}
              rows={3}
              className={`mt-1 block w-full border ${darkTheme.colors.inputText} ${darkTheme.colors.inputBorder} ${darkTheme.input} ${darkTheme.colors.inputBg} ${darkTheme.colors.inputFocusRing}`}
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
              className={`px-4 py-2 text-sm font-medium ${darkTheme.colors.buttonSecondary} ${darkTheme.rounded} transition duration-150`}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !isAuthorized}
              className={`px-4 py-2 text-sm font-medium ${darkTheme.colors.buttonPrimary} ${darkTheme.rounded} disabled:opacity-50 disabled:cursor-auto transition duration-150`}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
