// src/components/EditItemForm.tsx
'use client'

import React, { useState } from 'react'
// Importamos las interfaces compartidas del padre para asegurar la consistencia de tipos
import { IDataItem, IField } from './ManageSectionClient'
import { darkTheme } from '@/styles/darkTheme'
import { IProject } from '@/lib/project-utils'

// La interfaz de props utiliza el IDataItem importado, que tiene id: string | number.
interface EditItemFormProps {
  project: IProject
  section: string
  item: IDataItem // El ítem actual que se está editando
  adminKey: string
  fieldKeys: IField[]
  onUpdate: (data: IDataItem) => Promise<void>
  onClose: () => void
  isLoading: boolean
}

/**
 * Modal para la edición de un ítem existente, con campos generados dinámicamente.
 */
export function EditItemForm({
  project,
  section,
  item,
  adminKey,
  fieldKeys,
  onUpdate,
  onClose,
  isLoading,
}: EditItemFormProps) {
  // Inicializa el estado del formulario con los datos del ítem
  const [formData, setFormData] = useState<IDataItem>(item)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    // Validación básica: clave
    if (!adminKey) {
      setLocalError('Clave de administrador es obligatoria para la edición.')
      return
    }

    try {
      await onUpdate(formData)
    } catch (error) {
      setLocalError(
        'Fallo al actualizar el ítem. Verifica tu clave de administrador.'
      )
    }
  }

  return (
    <div
      className={`fixed inset-0 ${darkTheme.colors.modalOverlay} flex items-center justify-center p-4 z-50`}
    >
      <div
        className={`${darkTheme.colors.card} ${darkTheme.spacing.modalPadding} ${darkTheme.rounded} ${darkTheme.shadow} w-full max-w-lg transform transition-all scale-100 ease-out duration-300 max-h-[90vh] overflow-y-auto`}
      >
        <h3
          className={`${darkTheme.colors.heading} text-2xl font-bold mb-4 border-b pb-2`}
        >
          ✏️ Update Item IDNUM:{' '}
          <span className="font-mono text-lg bg-gray-700 px-2 rounded text-gray-100">
            {item.idNum}
          </span>
        </h3>

        {(localError || !adminKey) && (
          <div
            className={`border-l-4 p-3 mb-4 rounded ${
              localError
                ? `${darkTheme.colors.errorBg} ${darkTheme.colors.errorBorder} ${darkTheme.colors.errorText}`
                : 'bg-yellow-100 border-yellow-500 text-yellow-700'
            }`}
            role="alert"
          >
            {localError || 'Warning: The admin key is required to update.'}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 mb-6">
            {fieldKeys.map((field) => (
              <div key={field.key}>
                <label
                  htmlFor={field.key}
                  className={`${darkTheme.colors.label} block text-sm font-medium capitalize`}
                >
                  {field.key}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.key}
                    name={field.key}
                    value={formData[field.key] || ''}
                    onChange={handleChange}
                    rows={3}
                    className={`${darkTheme.input} ${darkTheme.colors.inputBg} ${darkTheme.colors.inputText} ${darkTheme.colors.inputBorder} ${darkTheme.colors.inputFocusRing} mt-1 block w-full`}
                    disabled={isLoading}
                  />
                ) : (
                  <input
                    id={field.key}
                    name={field.key}
                    type="text"
                    value={formData[field.key] || ''}
                    onChange={handleChange}
                    className={`${darkTheme.input} ${darkTheme.colors.inputBg} ${darkTheme.colors.inputText} ${darkTheme.colors.inputBorder} ${darkTheme.colors.inputFocusRing} mt-1 block w-full`}
                    disabled={isLoading}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-sm font-medium ${darkTheme.colors.text} bg-gray-700 rounded-md hover:bg-gray-600 transition duration-150 cursor-pointer`}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-sm font-medium ${darkTheme.colors.buttonPrimary} ${darkTheme.rounded} disabled:opacity-50 transition duration-150 cursor-pointer`}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
