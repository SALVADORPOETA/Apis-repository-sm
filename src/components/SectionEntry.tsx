// src/components/SectionEntry.tsx
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthModal } from './AuthModal' // Importamos el modal creado

interface SectionEntryProps {
  project: string
  section: string
  children: React.ReactNode
  className?: string
}

/**
 * Componente que envuelve un enlace, forzando la autenticación
 * en un modal antes de redirigir a la sección.
 */
export function SectionEntry({
  project,
  section,
  children,
  className,
}: SectionEntryProps) {
  const router = useRouter()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // 1. Función que se ejecuta al hacer clic en el enlace/botón
  const handleEntryClick = (e: React.MouseEvent) => {
    e.preventDefault() // Detiene la navegación por defecto
    setIsAuthModalOpen(true) // Abre el modal de autenticación
  }

  // 2. Función que se ejecuta tras una autenticación exitosa
  const handleAuthenticated = (adminKey: string) => {
    // Guardar la clave en localStorage para que 'ManageSectionClient' pueda usarla
    // y evitar que el usuario tenga que escribirla dos veces.
    localStorage.setItem('adminKey', adminKey)

    setIsAuthModalOpen(false) // Cierra el modal

    // Redirige al usuario a la sección solicitada
    router.push(`/admin/${project}/${section}`)
  }

  const fullPath = `/admin/${project}/${section}`

  return (
    <>
      {/* Usa un 'a' tag por semántica, pero con onClick para capturar el evento */}
      <a
        href={fullPath}
        onClick={handleEntryClick}
        className={className || 'text-indigo-600 hover:underline font-medium'}
      >
        {children}
      </a>

      {/* Renderiza el modal si está abierto */}
      {isAuthModalOpen && (
        <AuthModal
          onAuthenticated={handleAuthenticated}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </>
  )
}
