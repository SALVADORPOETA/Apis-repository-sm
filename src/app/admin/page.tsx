// src/app/admin/page.ts
'use client'

import { useEffect, useRef, useState } from 'react'
import { SectionEntry } from '@/components/SectionEntry'
import { IProject } from '@/lib/project-utils'
import { CreateProjectForm } from '@/components/CreateProjectForm'
import { EditProjectForm } from '@/components/EditProjectForm'
import { DeleteProjectModal } from '@/components/DeleteProjectModal'

export default function AdminHomePage() {
  const [projects, setProjects] = useState<IProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isAdminValidated, setIsAdminValidated] = useState<boolean>(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<IProject | null>(null)
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null)
  const [deletingProject, setDeletingProject] = useState<IProject | null>(null)
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects', {
          headers: { 'X-Admin-Key': 'admin-secret' },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Error loading projects')

        setProjects(Array.isArray(data) ? data : data.projects || [])
      } catch (err) {
        console.error(err)
        setError('Failed to load projects.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedInside = Object.values(menuRefs.current).some((ref) =>
        ref?.contains(event.target as Node)
      )
      if (!clickedInside) {
        setOpenMenuKey(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleProjectCreated = (newProject: IProject) => {
    setProjects((prev) => [...prev, newProject])
    setShowCreateModal(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center mt-10 text-red-600">
        {error}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto relative bg-gray-900 min-h-screen text-gray-100 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-4xl font-extrabold text-white">
          Centralized Administration Panel
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full md:w-auto px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 shadow cursor-pointer"
        >
          + Create Project
        </button>
      </div>

      <p className="text-gray-400 mb-8">
        Select a project and section to manage its content.
      </p>

      {projects.length === 0 ? (
        <div className="text-center text-gray-400">
          No projects created yet. Use the “Create Project” button to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((project) => (
            <div
              key={project.key}
              className="bg-gray-800 p-6 rounded-lg shadow-xl hover:shadow-2xl transition duration-300"
            >
              <div className="flex justify-between items-center mb-3 border-b border-gray-700 pb-2">
                <h3 className="text-xl font-semibold capitalize text-indigo-400">
                  {project.name}
                </h3>
                <div
                  className="relative"
                  ref={(el) => {
                    menuRefs.current[project.key] = el
                  }}
                >
                  <button
                    onClick={() =>
                      setOpenMenuKey(
                        openMenuKey === project.key ? null : project.key
                      )
                    }
                    title="Project Options"
                    className="text-gray-400 text-xl font-bold transition-all duration-200 
               hover:bg-gray-700 hover:text-white hover:rounded-full 
               w-8 h-8 flex items-center justify-center cursor-pointer"
                  >
                    ⋮
                  </button>

                  {openMenuKey === project.key && (
                    <div className="absolute right-0 mt-2 w-28 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50">
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer"
                        onClick={() => {
                          setSelectedProject(project)
                          setShowEditModal(true)
                          setOpenMenuKey(null)
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-red-500 cursor-pointer"
                        onClick={() => setDeletingProject(project)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <ul className="space-y-1">
                {project.sections.map((section) => (
                  <li key={section}>
                    <SectionEntry
                      project={project.key}
                      section={section}
                      className="text-indigo-300 hover:text-indigo-500"
                    >
                      Manage {section}
                    </SectionEntry>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Modales */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full relative max-h-[90%] overflow-y-auto text-gray-100">
            <CreateProjectForm
              onCreateSuccess={handleProjectCreated}
              onClose={() => setShowCreateModal(false)}
              isAdminValidated={isAdminValidated}
              onValidated={() => setIsAdminValidated(true)}
            />
          </div>
        </div>
      )}
      {/* Edit Project Modal */}
      {showEditModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full relative max-h-[90%] overflow-y-auto text-gray-100">
            <EditProjectForm
              project={selectedProject}
              onClose={() => setShowEditModal(false)}
              isAdminValidated={isAdminValidated}
              onSave={(updatedProject) => {
                setProjects((prev) =>
                  prev.map((p) =>
                    p.key === updatedProject.key ? updatedProject : p
                  )
                )
                setShowEditModal(false)
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Project Modal */}
      {deletingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full relative max-h-[90%] overflow-y-auto text-gray-100">
            <DeleteProjectModal
              projectKey={deletingProject.key}
              onClose={() => setDeletingProject(null)}
              onDeleteSuccess={(deletedKey) => {
                setProjects((prev) => prev.filter((p) => p.key !== deletedKey))
                setDeletingProject(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
