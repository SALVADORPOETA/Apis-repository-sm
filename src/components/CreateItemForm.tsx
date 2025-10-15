// src/components/CreateItemForm.tsx
'use client'

import React, { useState, useEffect } from 'react'
// Importamos las interfaces compartidas del padre (ManageSectionClient.tsx)
import { IDataItem, IField } from './ManageSectionClient'
import { darkTheme } from '@/styles/darkTheme'
import { IProject } from '@/lib/project-utils'

// **Aquí se define la interfaz con 'fieldKeys' para solucionar el error de tipado.**
interface CreateItemFormProps {
  project: IProject
  section: string
  adminKey: string
  fieldKeys: IField[] // Campos dinámicos a renderizar (¡Propiedad faltante!)
  onCreate: (data: Omit<IDataItem, 'id'>) => Promise<void> // Función de manejo de la API del padre
  onClose: () => void
  isLoading: boolean // Estado de carga del padre
}

/**
 * Modal para la creación de un nuevo ítem, con campos generados dinámicamente.
 */
export function CreateItemForm({
  project,
  section,
  adminKey,
  fieldKeys,
  onCreate,
  onClose,
  isLoading,
}: CreateItemFormProps) {
  // Estado para los datos del formulario (inicializado dinámicamente)
  const initialFormState = fieldKeys.reduce((acc, field) => {
    acc[field.key] = ''
    return acc
  }, {} as Record<string, any>)

  const [formData, setFormData] =
    useState<Record<string, any>>(initialFormState)
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

    // Validación básica: clave y al menos el primer campo
    if (!adminKey) {
      setLocalError('Clave de administrador es obligatoria.')
      return
    }
    if (fieldKeys.length > 0 && !formData[fieldKeys[0].key]) {
      setLocalError(`El campo '${fieldKeys[0].key}' es obligatorio.`)
      return
    }

    try {
      // Llama a la función de creación del componente padre (ManageSectionClient)
      await onCreate(formData)
    } catch (error) {
      setLocalError(
        'Fallo al crear el ítem. Verifica tu clave de administrador.'
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
          ➕ Create New Item in <span className="capitalize">{section}</span>
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
            {localError || 'Warning: The admin key is required to create.'}
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
          <div className="flex justify-end space-x-3 pt-4 border-t">
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
              {isLoading ? 'Creating...' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
