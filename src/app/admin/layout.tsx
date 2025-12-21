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
    <div className="min-h-screen bg-gray-900 relative">
      <AdminNav projects={projects} isLoading={isLoading} />

      <main
        className="
        p-8 overflow-y-auto
        md:ml-64
      "
      >
        {children}
      </main>
    </div>
  )
}
