// src/app/api/schemas/[project]/[section]/route.ts

import { NextResponse, NextRequest } from 'next/server'
import { getSectionSchema, setSectionSchema } from '@/lib/schema-utils-firebase'
import { isAuthenticated } from '@/lib/auth-utils'
import { DocumentData } from 'firebase/firestore'
// Usamos un tipo para claridad, PERO la implementación de Next.js lo pasa como Promise.
type Params = { project: string; section: string }

// GET: Leer el esquema de la sección (PÚBLICO)
export async function GET(
  request: Request,
  context: { params: Params }
): Promise<NextResponse<DocumentData | { fields: [] } | { message: string }>> {
  // ✅ CLAVE: Hacemos AWAIT del objeto 'params' del contexto
  const { project, section } = context.params

  try {
    const schemaData = await getSectionSchema(project, section)

    return NextResponse.json(schemaData || { fields: [] })
  } catch (error) {
    console.error(`Error en GET del esquema:`, error)
    return NextResponse.json(
      { message: 'Server error fetching schema' },
      { status: 500 }
    )
  }
}

// POST: Actualizar el esquema de la sección (PRIVADO, requiere Auth)
export async function POST(
  request: Request,
  context: { params: Params }
): Promise<NextResponse<{ fields: any[] } | { message: string }>> {
  // 1. AUTENTICACIÓN
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { message: 'Unauthorized: Invalid Admin Key' },
      { status: 401 }
    )
  }

  // ✅ CLAVE: Hacemos AWAIT del objeto 'params' del contexto
  const { project, section } = context.params

  try {
    // 2. OBTENER DATOS
    const newFields = await request.json()

    console.log(
      '[SCHEMA-UPDATE] Intentando actualizar el esquema en Firebase...'
    )

    // 3. LLAMADA ASÍNCRONA A FIREBASE
    const updatedSchema = await setSectionSchema(project, section, newFields)

    // 4. VERIFICACIÓN
    if (!updatedSchema) {
      throw new Error('Firestore failed to save the schema.')
    }

    console.log('[SCHEMA-UPDATE] Esquema actualizado con éxito.')

    // 5. RESPUESTA EXITOSA
    return NextResponse.json(updatedSchema)
  } catch (error) {
    // 6. MANEJO DE ERRORES
    console.error(
      '[SCHEMA-UPDATE] FALLO FATAL AL ESCRIBIR EN FIRESTORE:',
      error
    )

    return NextResponse.json(
      { message: 'Error updating schema (Firebase write failure)' },
      { status: 500 }
    )
  }
}
