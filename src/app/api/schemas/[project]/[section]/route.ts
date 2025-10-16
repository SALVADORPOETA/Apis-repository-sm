// src/app/api/schemas/[project]/[section]/route.ts

import { NextResponse } from 'next/server'
// Asegúrate de que este archivo usa las funciones de Firebase (getSectionSchema y setSectionSchema)
import { getSectionSchema, setSectionSchema } from '@/lib/schema-utils-firebase'
import { isAuthenticated } from '@/lib/auth-utils'
import { DocumentData } from 'firebase/firestore' // Importación necesaria si usas tipado de Firebase

// NO ES NECESARIO DEFINIR UN TIPO 'Params' externo.
// Usamos la forma de desestructuración que Next.js espera.

// GET: Leer el esquema de la sección (PÚBLICO)
export async function GET(
  request: Request,
  context: { params: { project: string; section: string } }
): Promise<NextResponse<DocumentData | { fields: [] } | { message: string }>> {
  const { project, section } = context.params

  try {
    // La función de Firebase es asíncrona (AWAIT)
    const schemaData = await getSectionSchema(project, section)

    // Devolvemos los datos del esquema o un array vacío si no existe
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
  context: { params: { project: string; section: string } }
): Promise<NextResponse<{ fields: any[] } | { message: string }>> {
  // 1. AUTENTICACIÓN
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { message: 'Unauthorized: Invalid Admin Key' },
      { status: 401 }
    )
  }

  const { project, section } = context.params

  try {
    // 2. OBTENER DATOS
    // newFields es el array de campos (IField[]) que enviaste desde el frontend.
    const newFields = await request.json()

    console.log(
      '[SCHEMA-UPDATE] Intentando actualizar el esquema en Firebase...'
    )

    // 3. LLAMADA ASÍNCRONA A FIREBASE
    const updatedSchema = await setSectionSchema(project, section, newFields)

    // 4. VERIFICACIÓN
    // Si setSectionSchema devuelve null, algo salió mal al escribir en Firebase (ej: error de red o permisos).
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
