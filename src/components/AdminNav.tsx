'use client'

import { useState, useRef } from 'react'
import { IProject } from '@/lib/project-utils'

interface AdminNavProps {
  projects: IProject[]
  isLoading?: boolean
  title?: string
}

export function AdminNav({
  projects = [],
  isLoading,
  title = 'Personal Data Repository 🌐',
}: AdminNavProps) {
  const [openProject, setOpenProject] = useState<string | null>(null)
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const toggleProject = (projectKey: string) => {
    setOpenProject(openProject === projectKey ? null : projectKey)
  }

  const navigateTo = (href: string, newTab = true) => {
    if (typeof window !== 'undefined') {
      if (newTab) window.open(href, '_blank', 'noopener,noreferrer')
      else window.location.href = href
    }
  }

  const [isOpen, setIsOpen] = useState(true)

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-gray-800 text-white p-2 rounded-md shadow-lg cursor-pointer"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          // X icon
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          // Menu icon
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>
      <nav
        className={`
    fixed top-0 left-0 h-screen w-64 bg-gray-800 p-4 shadow-lg overflow-y-auto
    transform transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    md:translate-x-0 z-40
  `}
      >
        <a
          onClick={() => navigateTo('/admin/', false)}
          className="block mb-4 cursor-pointer"
          aria-label="Go to Personal Data Repository"
        >
          <h2 className="text-2xl font-bold text-white hover:text-indigo-400 transition-colors mt-12 md:mt-0">
            Personal Data Repository 🌐
          </h2>
        </a>

        <div className="flex flex-col space-y-2">
          <p className="text-gray-400 text-sm uppercase font-semibold mb-6">
            Project's APIs
          </p>

          {isLoading ? (
            <p className="text-gray-400 text-sm">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="text-gray-400 text-sm">No projects available.</p>
          ) : (
            projects.map((project) => (
              <div key={project.key} className="relative">
                <button
                  onClick={() => toggleProject(project.key)}
                  className="w-full text-left text-white bg-gray-700 hover:bg-gray-600 p-2 rounded-md transition duration-150 capitalize flex justify-between items-center cursor-pointer"
                >
                  <span className="font-medium">{project.name}</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openProject === project.key ? 'transform rotate-90' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </button>

                <div
                  ref={(el) => {
                    contentRefs.current[project.key] = el
                  }}
                  style={{
                    maxHeight:
                      openProject === project.key
                        ? `${
                            contentRefs.current[project.key]?.scrollHeight || 0
                          }px`
                        : '0px',
                  }}
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                >
                  <div className="flex flex-col space-y-1 pl-4 mt-1 border-l-2 border-indigo-500 bg-gray-900 rounded-b-md p-1 pb-4 pt-2">
                    {project.sections?.map((section) => (
                      <a
                        key={section}
                        onClick={() =>
                          navigateTo(`/api/${project.key}/${section}`)
                        }
                        className="text-gray-300 hover:bg-indigo-700/50 p-2 rounded-md transition duration-150 text-sm capitalize cursor-pointer flex items-center gap-2 mr-2"
                      >
                        <span className="text-indigo-400">•</span>
                        {section}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}

          <button
            onClick={() => navigateTo('/', false)}
            className="mt-8 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition duration-200 font-medium cursor-pointer"
          >
            Go Home
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-500">Salvador Martinez - SM</p>
        </div>
      </nav>
    </div>
  )
}
