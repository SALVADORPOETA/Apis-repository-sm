// src/components/SchemaConfigModal.tsx
'use client'

import React, { useState } from 'react'
import { IField } from './ManageSectionClient' // Importamos la interfaz IField
import { darkTheme } from '@/styles/darkTheme'

interface SchemaConfigModalProps {
  initialSchema: IField[]
  adminKey: string
  onSave: (newSchema: IField[]) => Promise<void> // Función para guardar en la API del padre
  onClose: () => void
  isLoading: boolean
}

/**
 * Modal para configurar dinámicamente el esquema (campos) de una sección.
 */
export function SchemaConfigModal({
  initialSchema,
  adminKey,
  onSave,
  onClose,
  isLoading,
}: SchemaConfigModalProps) {
  // Estado local para la edición del esquema
  const [fields, setFields] = useState<IField[]>(initialSchema)
  const [localError, setLocalError] = useState<string | null>(null)

  // ----------------------------------------------------
  // MANEJADORES DE ESTADO DE CAMPOS
  // ----------------------------------------------------

  const handleAddField = () => {
    setFields((prev) => [
      ...prev,
      { key: `nuevo_campo_${prev.length + 1}`, type: 'input' },
    ])
  }

  const handleRemoveField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index))
  }

  const handleFieldChange = (
    index: number,
    fieldProp: 'key' | 'type',
    value: string
  ) => {
    setFields((prev) =>
      prev.map((field, i) =>
        i === index ? { ...field, [fieldProp]: value } : field
      )
    )
  }

  // ----------------------------------------------------
  // MANEJADOR DE ENVÍO
  // ----------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!adminKey) {
      setLocalError(
        'Clave de administrador es obligatoria para guardar el esquema.'
      )
      return
    }

    // Validación básica: asegura que no haya claves duplicadas o vacías
    const keys = fields.map((f) => f.key.trim())
    if (keys.some((key) => !key)) {
      setLocalError('Todos los nombres de campo (keys) deben estar definidos.')
      return
    }
    if (new Set(keys).size !== keys.length) {
      setLocalError('Los nombres de campo (keys) deben ser únicos.')
      return
    }

    try {
      await onSave(fields)
      // onSave maneja el cierre del modal si la API es exitosa
    } catch (error) {
      setLocalError(
        'Fallo al guardar el esquema. Revisa la consola y tu clave admin.'
      )
    }
  }

  // ----------------------------------------------------
  // RENDERIZADO
  // ----------------------------------------------------

  return (
    <div
      className={`fixed inset-0 ${darkTheme.colors.modalOverlay} flex items-center justify-center p-4 z-50`}
    >
      <div
        className={`${darkTheme.colors.card} ${darkTheme.spacing.modalPadding} ${darkTheme.rounded} ${darkTheme.shadow} w-full max-w-2xl transform transition-all scale-100 ease-out duration-300 max-h-[90vh] overflow-y-auto`}
      >
        <h3
          className={`${darkTheme.colors.heading} text-2xl font-bold mb-4 border-b pb-2`}
        >
          ⚙️ Configure Section Fields
        </h3>

        {localError && (
          <div
            className={`bg-red-900 ${darkTheme.colors.errorBorder} ${darkTheme.colors.errorText} p-3 mb-4 rounded font-medium`}
          >
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Lista de Campos Actuales */}
          <div className={`space-y-4 mb-6`}>
            <h4 className={`${darkTheme.colors.text} text-lg font-semibold`}>
              Field Definitions ({fields.length})
            </h4>
            {fields.map((field, index) => (
              <div
                key={index}
                className={`flex flex-col md:flex-row items-center gap-3 ${darkTheme.colors.card} p-3 ${darkTheme.rounded} border border-gray-600`}
              >
                {/* 1. Nombre de la Clave (Key) */}
                <div className="flex-1 w-full">
                  <label
                    className={`${darkTheme.colors.label} block text-xs font-medium mb-1`}
                  >
                    Key Name
                  </label>
                  <input
                    type="text"
                    value={field.key}
                    onChange={(e) =>
                      handleFieldChange(index, 'key', e.target.value)
                    }
                    className={`${darkTheme.input} ${darkTheme.colors.inputBg} ${darkTheme.colors.inputText} ${darkTheme.colors.inputBorder} ${darkTheme.colors.inputFocusRing} w-full text-sm font-mono`}
                    placeholder="ej: title, image_url, description"
                    disabled={isLoading}
                  />
                </div>

                {/* 2. Tipo de Campo (Type) */}
                <div className="w-full md:w-auto">
                  <label
                    className={`${darkTheme.colors.label} block text-xs font-medium mb-1`}
                  >
                    Input Type
                  </label>
                  <select
                    value={field.type}
                    onChange={(e) =>
                      handleFieldChange(index, 'type', e.target.value)
                    }
                    className={`${darkTheme.input} ${darkTheme.colors.inputBg} ${darkTheme.colors.inputText} ${darkTheme.colors.inputBorder} ${darkTheme.colors.inputFocusRing} w-full text-sm cursor-pointer`}
                    disabled={isLoading}
                  >
                    <option value="input">Input (Simple line)</option>
                    <option value="textarea">Textarea (Multiple lines)</option>
                  </select>
                </div>

                {/* 3. Botón de Eliminar */}
                <button
                  type="button"
                  onClick={() => handleRemoveField(index)}
                  className="mt-4 md:mt-auto p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors disabled:opacity-50 cursor-pointer"
                  disabled={isLoading}
                  aria-label="Delete Field"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 7a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm6 3a1 1 0 10-2 0v5a1 1 0 102 0v-5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Botón para Añadir un Nuevo Campo */}
          <button
            type="button"
            onClick={handleAddField}
            className={`w-full py-2 mb-6 text-sm font-semibold ${darkTheme.colors.buttonPrimary} border border-indigo-600 ${darkTheme.rounded} hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer`}
            disabled={isLoading}
          >
            + Add New Field
          </button>

          {/* Botones de Acción Global */}
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
              className={`px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 transition duration-150 cursor-pointer`}
              disabled={isLoading || !adminKey}
            >
              {isLoading ? 'Saving...' : 'Save Schema'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
