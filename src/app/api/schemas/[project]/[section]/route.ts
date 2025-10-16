// src/app/api/schemas/[project]/[section]/route.ts

import { NextResponse } from 'next/server'
// ⚠️ CAMBIAR ESTA LÍNEA por las nuevas funciones:
import {
  getSectionSchema,
  updateSectionSchema,
} from '@/lib/schema-utils-firebase'
import { isAuthenticated } from '@/lib/auth-utils'

// // src/app/api/schemas/[project]/[section]/route.ts
// import { NextResponse } from 'next/server'
// import { getSchema, updateSchema } from '@/lib/schema-utils-firebase'
// import { isAuthenticated } from '@/lib/auth-utils'

type Params = Promise<{ project: string; section: string }>

// GET: Leer el esquema de la sección (PÚBLICO)
export async function GET(request: Request, context: { params: Params }) {
  // ✅ CORRECCIÓN: Await params antes de desestructurar
  const params = await context.params
  const { project, section } = params

  try {
    const schema = getSectionSchema(project, section)
    return NextResponse.json(schema || [])
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// POST/PUT/PATCH: Actualizar el esquema de la sección (PRIVADO, requiere Auth)
export async function POST(request: Request, context: { params: Params }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { message: 'Unauthorized: Invalid Admin Key' },
      { status: 401 }
    )
  }

  // ✅ CORRECCIÓN: Await params antes de desestructurar
  const params = await context.params
  const { project, section } = params

  try {
    const newSchema = await request.json()

    // 🚨 AQUÍ ES DONDE NECESITAS EL PRÓXIMO LOG 🚨
    console.log(
      '[SCHEMA-UPDATE] Intentando actualizar el esquema en Firebase...'
    )

    const updatedSchema = updateSectionSchema(project, section, newSchema) // <--- Esta línea está fallando

    // El log se detiene si hay un error en updateSchema
    console.log('[SCHEMA-UPDATE] Esquema actualizado con éxito.')

    return NextResponse.json(updatedSchema) // <-- Se ejecutó, por eso Vercel te muestra 200
  } catch (error) {
    // ❌ ¡El error DEBE estar siendo capturado aquí! ❌
    console.error('[SCHEMA-UPDATE] FALLO FATAL DENTRO DE UPDATE-SCHEMA:', error)

    return NextResponse.json(
      { message: 'Error updating schema' },
      { status: 500 }
    )
  }

  // try {
  //   const newSchema = await request.json()
  //   const updatedSchema = updateSchema(project, section, newSchema)
  //   return NextResponse.json(updatedSchema)
  // } catch (error) {
  //   return NextResponse.json(
  //     { message: 'Error updating schema' },
  //     { status: 500 }
  //   )
  // }
}
