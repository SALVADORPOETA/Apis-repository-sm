// src/components/ManageSectionClient.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { CreateItemForm } from './CreateItemForm'
import { EditItemForm } from './EditItemForm'
import { SchemaConfigModal } from './SchemaConfigModal'
import { useRouter } from 'next/navigation'
import { darkTheme } from '@/styles/darkTheme'
import EditSectionForm from './EditSectionForm'
import { IProject } from '@/lib/project-utils'
import { updateProject } from '@/lib/projects-utils-firebase'

// Definición de tipos generales
export interface IDataItem {
  id: number | string
  [key: string]: any
}

// Interfaz para la definición de campos
export interface IField {
  key: string
  type: 'input' | 'textarea'
}

// Propiedades del componente Cliente
interface ManageSectionClientProps {
  project: IProject
  section: string
  initialData: IDataItem[]
  initialError: string | null
}

export function ManageSectionClient({
  project,
  section,
  initialData,
  initialError,
}: ManageSectionClientProps) {
  // ----------------------------------------------------
  // Bloqueo
  // ----------------------------------------------------
  const router = useRouter()

  useEffect(() => {
    // Bloquea acceso directo escribiendo la URL en la barra
    if (window.history.length <= 2) {
      router.replace('/admin')
    }
  }, [router])
  // ----------------------------------------------------
  // ESTADO
  // ----------------------------------------------------
  const [data, setData] = useState<IDataItem[]>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(initialError)

  // Estado crítico para la autenticación
  const [adminKey, setAdminKey] = useState('')

  useEffect(() => {
    const storedKey = localStorage.getItem('adminKey')
    if (storedKey) {
      setAdminKey(storedKey)
    }
  }, [])

  // ----------------------------------------------------
  // ✅ EFECTO PARA OBTENER LA DATA PÚBLICA (SOLO DEPENDE DE PROJECT Y SECTION)
  // ----------------------------------------------------
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      // Mantén el initialError que pudo venir del Server Component si quieres
      // pero limpia los errores de red/fetch al empezar la carga.
      setError(null)

      try {
        // ✅ USAR RUTA RELATIVA. SIN HEADERS DE AUTENTICACIÓN.
        const response = await fetch(`/api/${project}/${section}`, {
          method: 'GET',
          headers: {
            // ¡Quitamos el header 'X-Admin-Key' completamente de aquí!
            'Cache-Control': 'no-store',
          },
        })

        if (!response.ok) {
          // Si falla, el error proviene del Route Handler (e.g., Firebase).
          const result = await response.json()
          setError(
            result.message || `Error ${response.status}: Failed to load data.`
          )
        } else {
          const fetchedData = await response.json()
          setData(fetchedData)
        }
      } catch (e) {
        console.error('Client-side fetch error:', e)
        setError('Network error (Client).')
      } finally {
        setIsLoading(false)
      }
    }

    // Ejecutar el fetch inmediatamente.
    fetchData()

    // El fetch de data pública SÓLO depende de project y section.
  }, [project, section])

  // Estados para la gestión de modales y edición
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<IDataItem | null>(null)
  const [deletingId, setDeletingId] = useState<number | string | null>(null)

  // ----------------------------------------------------
  // LÓGICA DE ESQUEMA DINÁMICO
  // ----------------------------------------------------
  const [fieldKeys, setFieldKeys] = useState<IField[]>([])
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false)

  // 1. EFECTO: Obtener el esquema de la API al cargar el componente
  useEffect(() => {
    const fetchSchema = async () => {
      try {
        // Llama a la nueva API de esquemas (endpoint público GET)
        const res = await fetch(`/api/schemas/${project}/${section}`)
        if (res.ok) {
          const schema = await res.json()
          setFieldKeys(schema)
        } else {
          // Si no hay esquema, usa el esquema base por defecto
          setFieldKeys([
            { key: 'title', type: 'input' },
            { key: 'description', type: 'textarea' },
          ])
        }
      } catch (e) {
        console.error('Error fetching schema:', e)
      }
    }
    fetchSchema()
  }, [project, section]) // Se ejecuta una sola vez al cargar la sección

  // 2. FUNCIÓN: Guardar el esquema usando la clave admin
  const handleSaveSchema = async (newSchema: IField[]) => {
    if (!adminKey) {
      setError(
        'Authentication missing. Please return to the Admin Panel home and re-enter the section.'
      )
      return
    }
    setIsLoading(true)

    try {
      const response = await fetch(`/api/schemas/${project}/${section}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey,
        },
        body: JSON.stringify(newSchema),
      })

      if (response.ok) {
        setFieldKeys(newSchema) // Actualiza el estado local
        setIsSchemaModalOpen(false) // Cierra el modal
        setError(null)
      } else {
        const result = await response.json()
        setError(
          result.message || 'Error saving schema: Please verify the admin key.'
        )
      }
    } catch (e) {
      setError('Network error.')
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSection = async (newName: string) => {
    if (!project?.key) {
      console.error('Project key is missing!')
      return
    }

    const updatedSections = sections.map((s) =>
      s === sectionToEdit ? newName : s
    )

    setSections(updatedSections)
    setEditingSection(false)
    setSectionToEdit(null)

    try {
      await updateProject(project.key, { sections: updatedSections })
      console.log('Section updated successfully!')
    } catch (error) {
      console.error('Error updating section in Firestore:', error)
    }
  }

  // ----------------------------------------------------
  // LÓGICA DE API (POST/PATCH/DELETE) - Descomentada
  // ----------------------------------------------------

  /**
   * Maneja la creación de un nuevo ítem (POST).
   */
  const handleCreateItem = async (newItemData: Omit<IDataItem, 'id'>) => {
    if (!adminKey) {
      setError(
        'Authentication missing. Please return to the Admin Panel home and re-enter the section.'
      )
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/${project}/${section}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey,
        },
        body: JSON.stringify(newItemData),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.message || 'Unknown error creating item.')
        return
      }

      const createdItem = result.item
      setData((prevData) => [...prevData, createdItem])
      setIsCreateModalOpen(false)
    } catch (err) {
      setError('Network or server error.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Maneja la actualización de un ítem existente (PATCH).
   */
  const handleUpdateItem = async (updatedItem: IDataItem) => {
    if (!adminKey) {
      setError(
        'Authentication missing. Please return to the Admin Panel home and re-enter the section.'
      )
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/${project}/${section}?id=${updatedItem.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Key': adminKey,
          },
          body: JSON.stringify(updatedItem),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        setError(result.message || 'Unknown error updating item.')
        return
      }

      setData((prevData) =>
        prevData.map((item) =>
          item.id === updatedItem.id ? result.item : item
        )
      )
      setEditingItem(null)
    } catch (err) {
      setError('Network or server error.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Maneja la eliminación de un ítem (DELETE).
   */
  const handleDeleteItem = async (id: number | string) => {
    if (!adminKey) {
      setError(
        'Authentication missing. Please return to the Admin Panel home and re-enter the section.'
      )
      setDeletingId(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/${project}/${section}?id=${id}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Key': adminKey,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.message || 'Unknown error deleting item.')
        return
      }

      setData((prevData) => prevData.filter((item) => item.id !== id))
      setDeletingId(null)
    } catch (err) {
      setError('Network or server error.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Estado para ordenar idNum
  const [sortIdNumAsc, setSortIdNumAsc] = useState(true)

  // Datos ordenados por idNum si existe
  const sortedData = [...data].sort((a, b) => {
    const valA = a.idNum
    const valB = b.idNum

    if (valA == null) return 1
    if (valB == null) return -1

    return sortIdNumAsc ? valA - valB : valB - valA
  })

  // Estados para el menú de la sección
  const [showMenu, setShowMenu] = useState(false)
  const [editingSection, setEditingSection] = useState(false)
  const [sectionToEdit, setSectionToEdit] = useState<string | null>(null)
  const [sections, setSections] = useState<string[]>(project.sections || [])

  const menuRef = useRef<HTMLDivElement>(null)

  // Cierra el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // ----------------------------------------------------
  // RENDERIZADO
  // ----------------------------------------------------
  return (
    <div
      className={`${darkTheme.colors.background} min-h-screen font-sans p-4 md:p-8`}
    >
      <h1
        className={`flex items-center text-3xl font-extrabold mb-5 ${darkTheme.colors.heading}`}
      >
        CMS: {project.toString().toUpperCase()}/{section.toUpperCase()}
        {/* Botón de 3 puntos */}
        {/* <div className="relative">
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className={`px-2 py-0 mx-2 rounded-full hover:bg-gray-800 transition ${darkTheme.colors.text} cursor-pointer`}
          >
            ⋮
          </button>

          {showMenu && (
            <div
              ref={menuRef}
              className={`absolute right-0 mt-2 w-40 ${darkTheme.colors.card} ${darkTheme.rounded} ${darkTheme.shadow} border border-gray-700`}
            >
              <button
                onClick={() => {
                  setShowMenu(false)
                  setSectionToEdit(section) // 'section' es la sección actual del iterador
                  setEditingSection(true)
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer"
              >
                Edit Section
              </button>
              <button
                onClick={() => {
                  setShowMenu(false)
                  // setShowDeleteModal(true)
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 text-red-400 cursor-pointer"
              >
                Delete Section
              </button>
            </div>
          )}
        </div> */}
      </h1>
      <div className="mb-6">
        {sections.map((sec, index) => (
          <div
            key={index}
            className="relative flex items-center justify-between p-2 border-b border-gray-700"
          >
            <span className="text-gray-300">{sec}</span>
            <div className="relative">
              <button
                onClick={() => {
                  setSectionToEdit(sec)
                  setEditingSection(true)
                }}
                className="px-2 py-1 text-sm hover:bg-gray-700 rounded"
              >
                ⋮
              </button>
            </div>
          </div>
        ))}
        <p className="mb-4 text-sm font-semibold text-indigo-500">
          Status:
          <span
            className={`ml-2 px-3 py-1 rounded-full ${
              adminKey
                ? `${darkTheme.colors.successBg} ${darkTheme.colors.successText}`
                : `${darkTheme.colors.errorBg} ${darkTheme.colors.errorText}`
            }`}
          >
            {adminKey ? '✅ Authenticated' : '❌ Key Missing'}
          </span>
        </p>
      </div>

      {/* Área de Errores */}
      {error && (
        <div
          className={`border-l-4 p-4 mb-4 rounded-lg font-mono ${darkTheme.colors.errorBg} ${darkTheme.colors.errorBorder} ${darkTheme.colors.errorText}`}
        >
          <p className="font-bold">Authentication/Server Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <h2 className={`text-2xl font-bold ${darkTheme.colors.text}`}>
          Section Items ({data.length})
        </h2>
        <div className="flex space-x-3">
          {/* Botón: Configurar Esquema */}
          <button
            onClick={() => setIsSchemaModalOpen(true)}
            className={`flex items-center px-4 py-2 ${darkTheme.colors.buttonExtra} font-semibold ${darkTheme.rounded} shadow-md transition duration-150 disabled:opacity-50 cursor-pointer`}
            disabled={isLoading}
          >
            ⚙️ Configure Fields ({fieldKeys.length})
          </button>

          {/* Botón: Add New Item */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className={`flex items-center px-4 py-2 ${darkTheme.colors.buttonPrimary} font-semibold ${darkTheme.rounded} shadow-md hover:bg-indigo-700 transition duration-150 disabled:opacity-50 cursor-pointer`}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : '+ Add New Item'}
          </button>

          {/* Botón: Sort */}
          <button
            className={`flex items-center px-4 py-2 ${darkTheme.colors.buttonInfo} font-semibold ${darkTheme.rounded} shadow-md hover:bg-blue-700 transition duration-150 disabled:opacity-50 cursor-pointer`}
            onClick={() => setSortIdNumAsc(!sortIdNumAsc)}
          >
            Sort by IDNUM {sortIdNumAsc ? '↑' : '↓'}
          </button>
        </div>
      </div>
      <div
        className={`${darkTheme.colors.card} ${darkTheme.spacing.cardPadding} ${darkTheme.rounded} ${darkTheme.shadow} overflow-x-auto`}
      >
        <table className="min-w-full divide-y divide-gray-700">
          <thead className={`${darkTheme.colors.modalOverlay}`}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400 cursor-pointer">
                ID
              </th>
              {Array.isArray(fieldKeys) &&
                fieldKeys.map((field) => (
                  <th
                    key={field.key}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400"
                  >
                    {field.key}
                  </th>
                ))}
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sortedData.map((item, index) => (
              <tr
                key={item.id || index}
                className="hover:bg-indigo-900/10 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">
                  {item.id}
                </td>
                {Array.isArray(fieldKeys) &&
                  fieldKeys.map((field) => (
                    <td
                      key={`${item.id}-${field.key}`}
                      className="px-6 py-4 text-sm text-gray-300 truncate max-w-xs"
                    >
                      {String(item[field.key]).substring(0, 50)}...
                    </td>
                  ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex space-x-2">
                  <button
                    onClick={() => setEditingItem(item)}
                    className={`${darkTheme.colors.buttonPrimary} ${darkTheme.rounded} px-2 py-1 text-sm font-medium`}
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setDeletingId(item.id)}
                    className={`${darkTheme.colors.buttonInfo} ${darkTheme.rounded} px-2 py-1 text-sm font-medium`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Confirmación de Eliminación (Reemplazo de confirm()) */}
      {deletingId !== null && (
        <div
          className={`fixed inset-0 ${darkTheme.colors.modalOverlay} flex items-center justify-center p-4 z-50`}
        >
          <div
            className={`${darkTheme.colors.card} ${darkTheme.spacing.modalPadding} ${darkTheme.rounded} ${darkTheme.shadow} max-w-sm w-full transform transition-all scale-100 ease-out duration-300`}
          >
            <h3
              className={`${darkTheme.colors.heading} text-xl font-bold mb-4`}
            >
              ⚠️ Confirm Deletion
            </h3>
            <p className={`${darkTheme.colors.text} mb-6`}>
              Are you sure you want to delete the item with IDNUM:
              <span className="font-mono bg-gray-700 text-gray-100 px-2 py-0.5 rounded ml-1">
                {sortedData.find((it) => it.id === deletingId)?.idNum ??
                  'Unknown'}
              </span>
              ? This action is{' '}
              <span className={darkTheme.colors.errorText}>irreversible</span>.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeletingId(null)}
                className={`px-4 py-2 text-sm font-medium ${darkTheme.colors.text} bg-gray-700 rounded-md hover:bg-gray-600 transition duration-150 cursor-pointer`}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteItem(deletingId)}
                className={`px-4 py-2 text-sm font-medium ${darkTheme.colors.buttonDanger} ${darkTheme.rounded} disabled:opacity-50 transition duration-150 cursor-pointer`}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Creación */}
      {isCreateModalOpen && (
        <CreateItemForm
          project={project}
          section={section}
          fieldKeys={fieldKeys}
          adminKey={adminKey}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateItem}
          isLoading={isLoading}
        />
      )}

      {/* Modal de Edición */}
      {editingItem && (
        <EditItemForm
          project={project}
          section={section}
          item={editingItem}
          fieldKeys={fieldKeys}
          adminKey={adminKey}
          onClose={() => setEditingItem(null)}
          onUpdate={handleUpdateItem}
          isLoading={isLoading}
        />
      )}

      {/* MODAL DE CONFIGURACIÓN DE ESQUEMA */}
      {isSchemaModalOpen && (
        <SchemaConfigModal
          initialSchema={fieldKeys}
          adminKey={adminKey}
          onSave={handleSaveSchema}
          onClose={() => setIsSchemaModalOpen(false)}
          isLoading={isLoading}
        />
      )}

      {/* MODAL DE EDIT SECTION */}
      {editingSection && sectionToEdit && (
        <EditSectionForm
          section={sectionToEdit}
          onCancel={() => setEditingSection(false)}
          onSave={handleSaveSection}
        />
      )}
    </div>
  )
}
