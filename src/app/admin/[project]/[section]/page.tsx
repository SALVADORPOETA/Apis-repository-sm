// src/app/admin/[project]/[section]/page.tsx
import { IDataItem } from '@/lib/data-utils'
import { ManageSectionClient } from '@/components/ManageSectionClient'
import { IProject } from '@/lib/project-utils'

interface SectionPageProps {
  params: Promise<{
    project: IProject
    section: string
  }>
}

// ESTA FUNCIÓN ES UN SERVER COMPONENT
export default async function ManageSectionPage(props: SectionPageProps) {
  // ✅ CORRECCIÓN: Await params antes de desestructurar
  const params = await props.params
  const { project, section } = params

  let data: IDataItem[] = []
  let error: string | null = null

  try {
    // La URL de fetch debe ser absoluta en el servidor
    // Usamos el entorno para que funcione tanto en local como en Vercel
    const baseUrl =
      process.env.NODE_ENV === 'production' && process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}` // Usa VERCEL_URL si está disponible en producción
        : 'http://localhost:3000'

    const res = await fetch(`${baseUrl}/api/${project}/${section}`, {
      // Configuraciones para que Next.js no cachee la data si la quieres fresca
      cache: 'no-store',
    })

    if (!res.ok) {
      error = `Error al obtener data: ${res.status} ${res.statusText}`
    } else {
      data = await res.json()
    }
  } catch (e) {
    console.error('Error en fetch de Server Component:', e)
    error = 'No se pudo conectar con el servidor de API.'
  } // 2. Pasamos la data ya resuelta al componente cliente

  return (
    <ManageSectionClient
      project={project}
      section={section}
      initialData={data}
      initialError={error}
    />
  )
}
