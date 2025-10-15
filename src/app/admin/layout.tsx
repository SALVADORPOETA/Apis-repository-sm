'use client'

import { useState, useEffect } from 'react'
import { AdminNav } from '@/components/AdminNav'
import { IProject } from '@/lib/project-utils'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [projects, setProjects] = useState<IProject[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects', {
          headers: { 'X-Admin-Key': 'admin-secret' },
        })
        const data = await res.json()
        setProjects(Array.isArray(data) ? data : data.projects || [])
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  return (
    <div className="min-h-screen flex bg-gray-900">
      <aside className="w-64">
        {/* Pasamos los proyectos al AdminNav */}
        <AdminNav projects={projects} isLoading={isLoading} />
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}
